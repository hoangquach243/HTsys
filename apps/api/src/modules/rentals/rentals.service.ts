import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RentalsService {
    constructor(private readonly prisma: PrismaService) { }

    // --- Vehicles ---
    async getVehicles(propertyId: string) {
        return (this.prisma as any).vehicle.findMany({
            where: { propertyId },
            orderBy: { plateNumber: 'asc' },
        });
    }

    async createVehicle(propertyId: string, data: any) {
        return (this.prisma as any).vehicle.create({
            data: {
                ...data,
                propertyId,
            },
        });
    }

    async updateVehicle(id: string, data: any) {
        return (this.prisma as any).vehicle.update({
            where: { id },
            data,
        });
    }

    async deleteVehicle(id: string) {
        return (this.prisma as any).vehicle.delete({ where: { id } });
    }

    // --- Rentals ---
    async getRentals(propertyId: string) {
        return (this.prisma as any).vehicleRental.findMany({
            where: { propertyId },
            include: {
                vehicle: true,
                booking: {
                    include: { guest: true, bookingRooms: { include: { room: true } } }
                }
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async createRental(propertyId: string, data: any) {
        const { vehicleId, bookingId, startTime, endTime, pricePerDay, ...rest } = data;

        // Calculate total amount
        const start = new Date(startTime);
        const end = new Date(endTime);
        const durationMs = end.getTime() - start.getTime();
        const days = Math.max(1, Math.ceil(durationMs / (1000 * 60 * 60 * 24)));
        const totalAmount = days * (pricePerDay || 0);

        return (this.prisma as any).$transaction(async (tx: any) => {
            let serviceUsageId = null;

            if (bookingId) {
                // Find or create 'Thuê xe' service for this property
                let service = await tx.service.findFirst({
                    where: { propertyId, code: 'RENTAL_SVC' }
                });
                if (!service) {
                    service = await tx.service.create({
                        data: {
                            name: 'Dịch vụ Thuê xe',
                            code: 'RENTAL_SVC',
                            group: 'Vận chuyển',
                            price: 0,
                            pricingMode: 'FIXED',
                            type: 'SERVICE',
                            propertyId,
                        }
                    });
                }

                // Create ServiceUsage
                const usage = await tx.serviceUsage.create({
                    data: {
                        bookingId: bookingId,
                        serviceId: service.id,
                        quantity: 1,
                        unitPrice: totalAmount,
                        amount: totalAmount,
                        date: start,
                        note: `Thuê xe: ${rest.vehicleName || 'N/A'}`,
                    }
                });
                serviceUsageId = usage.id;

                // Update booking totalAmount
                const booking = await tx.booking.findUnique({ where: { id: bookingId } });
                if (booking) {
                    let newStatus = booking.paymentStatus;
                    const newTotal = booking.totalAmount + totalAmount;

                    if (booking.paidAmount >= newTotal && newTotal > 0) newStatus = 'PAID';
                    else if (booking.paidAmount > 0) newStatus = 'PARTIAL';
                    else newStatus = 'UNPAID';

                    await tx.booking.update({
                        where: { id: bookingId },
                        data: { totalAmount: newTotal, paymentStatus: newStatus }
                    });
                }
            }

            // Create rental
            const rental = await tx.vehicleRental.create({
                data: {
                    ...rest,
                    vehicleId: vehicleId || null,
                    bookingId: bookingId || null,
                    serviceUsageId,
                    startTime: start,
                    endTime: end,
                    pricePerDay: pricePerDay || 0,
                    totalAmount,
                    propertyId,
                },
            });

            // Update vehicle status ONLY if it's an internal vehicle
            if (vehicleId) {
                await tx.vehicle.update({
                    where: { id: vehicleId },
                    data: { status: 'RENTED' },
                });
            }

            return rental;
        });
    }

    async recordPickup(id: string) {
        return (this.prisma as any).vehicleRental.update({
            where: { id },
            data: { actualPickupTime: new Date() },
        });
    }

    async recordReturn(id: string) {
        return (this.prisma as any).$transaction(async (tx: any) => {
            const rental = await tx.vehicleRental.update({
                where: { id },
                data: {
                    actualReturnTime: new Date(),
                    status: 'COMPLETED'
                },
            });

            if (rental.vehicleId) {
                await tx.vehicle.update({
                    where: { id: rental.vehicleId },
                    data: { status: 'AVAILABLE' },
                });
            }

            return rental;
        });
    }

    async updateRentalStatus(id: string, status: any) {
        return (this.prisma as any).$transaction(async (tx: any) => {
            const rental = await tx.vehicleRental.update({
                where: { id },
                data: { status },
            });

            if (rental.vehicleId) {
                if (status === 'COMPLETED' || status === 'CANCELLED') {
                    await tx.vehicle.update({
                        where: { id: rental.vehicleId },
                        data: { status: 'AVAILABLE' },
                    });
                } else if (status === 'ACTIVE') {
                    await tx.vehicle.update({
                        where: { id: rental.vehicleId },
                        data: { status: 'RENTED' },
                    });
                }
            }

            return rental;
        });
    }

    async updateRental(id: string, data: any) {
        const { vehicleId, bookingId, startTime, endTime, pricePerDay, totalAmount, ...rest } = data;

        // If totalAmount is not provided, calculate it
        let calculatedTotal = totalAmount;
        if (startTime && endTime) {
            const start = new Date(startTime);
            const end = new Date(endTime);
            const durationMs = end.getTime() - start.getTime();
            const days = Math.max(1, Math.ceil(durationMs / (1000 * 60 * 60 * 24)));
            calculatedTotal = days * (pricePerDay || 0);
        }

        return (this.prisma as any).$transaction(async (tx: any) => {
            const existingRental = await tx.vehicleRental.findUnique({
                where: { id },
                include: { serviceUsage: true }
            });
            if (!existingRental) throw new NotFoundException('Rental not found');

            // Remove old ServiceUsage if it exists to cleanly recreate it
            if (existingRental.serviceUsageId) {
                await tx.serviceUsage.delete({ where: { id: existingRental.serviceUsageId } });
                // Re-calculate old booking total
                if (existingRental.bookingId) {
                    const oldBooking = await tx.booking.findUnique({ where: { id: existingRental.bookingId } });
                    if (oldBooking) {
                        const newTotal = Math.max(0, oldBooking.totalAmount - existingRental.serviceUsage.amount);
                        let newStatus = oldBooking.paymentStatus;
                        if (oldBooking.paidAmount >= newTotal && newTotal > 0) newStatus = 'PAID';
                        else if (oldBooking.paidAmount > 0) newStatus = 'PARTIAL';
                        else newStatus = 'UNPAID';
                        await tx.booking.update({
                            where: { id: oldBooking.id },
                            data: { totalAmount: newTotal, paymentStatus: newStatus }
                        });
                    }
                }
            }

            // If new bookingId provided, create new ServiceUsage
            let newServiceUsageId = null;
            if (bookingId) {
                // Find or create 'Thuê xe' service
                let service = await tx.service.findFirst({
                    where: { propertyId: existingRental.propertyId, code: 'RENTAL_SVC' }
                });
                if (!service) {
                    service = await tx.service.create({
                        data: {
                            name: 'Dịch vụ Thuê xe',
                            code: 'RENTAL_SVC',
                            group: 'Vận chuyển',
                            price: 0,
                            pricingMode: 'FIXED',
                            type: 'SERVICE',
                            propertyId: existingRental.propertyId,
                        }
                    });
                }

                // Create ServiceUsage
                const usage = await tx.serviceUsage.create({
                    data: {
                        bookingId: bookingId,
                        serviceId: service.id,
                        quantity: 1,
                        unitPrice: calculatedTotal,
                        amount: calculatedTotal,
                        date: startTime ? new Date(startTime) : existingRental.startTime,
                        note: `Thuê xe: ${rest.vehicleName || existingRental.vehicleName || 'N/A'}`,
                    }
                });
                newServiceUsageId = usage.id;

                // Update booking totalAmount
                const booking = await tx.booking.findUnique({ where: { id: bookingId } });
                if (booking) {
                    let newStatus = booking.paymentStatus;
                    const newTotal = booking.totalAmount + calculatedTotal;

                    if (booking.paidAmount >= newTotal && newTotal > 0) newStatus = 'PAID';
                    else if (booking.paidAmount > 0) newStatus = 'PARTIAL';
                    else newStatus = 'UNPAID';

                    await tx.booking.update({
                        where: { id: bookingId },
                        data: { totalAmount: newTotal, paymentStatus: newStatus }
                    });
                }
            }

            return tx.vehicleRental.update({
                where: { id },
                data: {
                    ...rest,
                    vehicleId: vehicleId || null,
                    bookingId: bookingId || null,
                    serviceUsageId: newServiceUsageId,
                    startTime: startTime ? new Date(startTime) : undefined,
                    endTime: endTime ? new Date(endTime) : undefined,
                    pricePerDay: pricePerDay !== undefined ? pricePerDay : undefined,
                    totalAmount: calculatedTotal,
                },
            });
        });
    }

    async deleteRental(id: string) {
        const rental = await (this.prisma as any).vehicleRental.findUnique({ where: { id } });
        if (!rental) throw new NotFoundException('Rental not found');

        return (this.prisma as any).$transaction(async (tx: any) => {
            if (rental.serviceUsageId) {
                const serviceUsage = await tx.serviceUsage.findUnique({ where: { id: rental.serviceUsageId } });
                if (serviceUsage) {
                    await tx.serviceUsage.delete({ where: { id: rental.serviceUsageId } });
                    // Re-calculate old booking total
                    if (rental.bookingId) {
                        const oldBooking = await tx.booking.findUnique({ where: { id: rental.bookingId } });
                        if (oldBooking) {
                            const newTotal = Math.max(0, oldBooking.totalAmount - serviceUsage.amount);
                            let newStatus = oldBooking.paymentStatus;
                            if (oldBooking.paidAmount >= newTotal && newTotal > 0) newStatus = 'PAID';
                            else if (oldBooking.paidAmount > 0) newStatus = 'PARTIAL';
                            else newStatus = 'UNPAID';
                            await tx.booking.update({
                                where: { id: oldBooking.id },
                                data: { totalAmount: newTotal, paymentStatus: newStatus }
                            });
                        }
                    }
                }
            }

            await tx.vehicleRental.delete({ where: { id } });

            if (rental.vehicleId) {
                await tx.vehicle.update({
                    where: { id: rental.vehicleId },
                    data: { status: 'AVAILABLE' }
                });
            }
        });
    }
}
