import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateServiceDto, UpdateServiceDto, CreateServiceUsageDto } from './dto/services.dto';

@Injectable()
export class ServicesService {
    constructor(private prisma: PrismaService) { }

    // ===== SERVICES CATALOG =====

    findAll(propertyId: string, query?: any) {
        const where: any = { propertyId };

        if (query?.isActive !== undefined) {
            where.isActive = query.isActive === 'true';
        }
        if (query?.type) where.type = query.type;
        if (query?.group) where.group = query.group;

        return this.prisma.service.findMany({
            where,
            orderBy: { name: 'asc' }
        });
    }

    async findById(id: string) {
        const service = await this.prisma.service.findUnique({ where: { id } });
        if (!service) throw new NotFoundException('Service not found');
        return service;
    }

    create(dto: CreateServiceDto) {
        return this.prisma.service.create({
            data: dto
        });
    }

    async update(id: string, dto: UpdateServiceDto) {
        await this.findById(id);
        return this.prisma.service.update({
            where: { id },
            data: dto
        });
    }

    async delete(id: string) {
        await this.findById(id);
        return this.prisma.service.delete({ where: { id } });
    }

    // ===== SERVICE USAGES (in Bookings) =====

    async addServiceToBooking(dto: CreateServiceUsageDto) {
        const data: any = { ...dto };
        if (dto.date) data.date = new Date(dto.date);

        return this.prisma.serviceUsage.create({
            data
        });
    }

    async removeServiceFromBooking(usageId: string) {
        return this.prisma.serviceUsage.delete({ where: { id: usageId } });
    }

    async getBookingServices(bookingId: string) {
        return this.prisma.serviceUsage.findMany({
            where: { bookingId },
            include: { service: true },
            orderBy: { date: 'desc' }
        });
    }
}
