import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateGuestDto, UpdateGuestDto } from './dto/guests.dto';

@Injectable()
export class GuestsService {
    constructor(private prisma: PrismaService) { }

    findAll(propertyId: string, search?: string) {
        const where: any = { propertyId };

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search } },
                { email: { contains: search, mode: 'insensitive' } },
                { idNumber: { contains: search } }
            ];
        }

        return this.prisma.guest.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                guestLabels: {
                    include: { label: true }
                },
                _count: {
                    select: { bookings: true }
                }
            }
        });
    }

    async findById(id: string) {
        const guest = await this.prisma.guest.findUnique({
            where: { id },
            include: {
                bookings: {
                    orderBy: { checkIn: 'desc' },
                    include: {
                        bookingRooms: {
                            include: { roomType: true, room: true }
                        }
                    }
                },
                guestLabels: {
                    include: { label: true }
                }
            }
        });

        if (!guest) throw new NotFoundException('Guest not found');
        return guest;
    }

    create(dto: CreateGuestDto) {
        return this.prisma.guest.create({
            data: {
                name: dto.name,
                phone: dto.phone,
                email: dto.email,
                idNumber: dto.idNumber,
                nationality: dto.nationality,
                gender: dto.gender,
                dob: dto.dob ? new Date(dto.dob) : null,
                language: dto.language || 'vi',
                notes: dto.notes,
                propertyId: dto.propertyId
            }
        });
    }

    async update(id: string, dto: UpdateGuestDto) {
        await this.findById(id);

        const data: any = { ...dto };
        if (dto.dob) data.dob = new Date(dto.dob);

        return this.prisma.guest.update({
            where: { id },
            data
        });
    }

    async delete(id: string) {
        await this.findById(id);
        return this.prisma.guest.delete({ where: { id } });
    }

    async addLabel(guestId: string, labelId: string) {
        return this.prisma.guestLabel.create({
            data: { guestId, labelId }
        });
    }

    async removeLabel(guestId: string, labelId: string) {
        return this.prisma.guestLabel.delete({
            where: {
                guestId_labelId: { guestId, labelId }
            }
        });
    }
}
