import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRoomTypeDto, UpdateRoomTypeDto, CreateRoomDto, UpdateRoomDto, CreateRatePlanDto } from './dto/rooms.dto';

@Injectable()
export class RoomsService {
    constructor(private readonly prisma: PrismaService) { }

    // ===== Room Types =====

    async findAllTypes(propertyId: string) {
        return this.prisma.roomType.findMany({
            where: { propertyId },
            include: {
                rooms: { select: { id: true, roomNumber: true, status: true, floor: true } },
                _count: { select: { rooms: true } },
            },
            orderBy: { sortOrder: 'asc' },
        });
    }

    async findTypeById(id: string) {
        const roomType = await this.prisma.roomType.findUnique({
            where: { id },
            include: {
                rooms: { orderBy: { roomNumber: 'asc' } },
                ratePlans: { orderBy: { isDefault: 'desc' } },
            },
        });

        if (!roomType) throw new NotFoundException('Loại phòng không tồn tại');
        return roomType;
    }

    async createType(dto: CreateRoomTypeDto) {
        // Auto-generate code if not provided
        let code = dto.code;
        if (!code) {
            const count = await this.prisma.roomType.count({ where: { propertyId: dto.propertyId } });
            code = `RT${(count + 1).toString().padStart(3, '0')}`;
        }

        return this.prisma.roomType.create({
            data: {
                name: dto.name,
                code,
                kind: dto.kind as any || 'ROOM',
                description: dto.description,
                maxAdults: dto.maxAdults ?? 2,
                maxChildren: dto.maxChildren ?? 1,
                maxInfants: dto.maxInfants ?? 1,
                basePrice: dto.basePrice ?? 0,
                weekendPrice: dto.weekendPrice,
                amenities: dto.amenities ?? [],
                photos: dto.photos ?? [],
                propertyId: dto.propertyId,
            },
            include: { rooms: true },
        });
    }

    async updateType(id: string, dto: UpdateRoomTypeDto) {
        await this.findTypeById(id);
        return this.prisma.roomType.update({
            where: { id },
            data: dto as any,
            include: { rooms: true, ratePlans: true },
        });
    }

    async deleteType(id: string) {
        await this.findTypeById(id);
        return this.prisma.roomType.delete({ where: { id } });
    }

    // ===== Rooms =====

    async createRoom(dto: CreateRoomDto) {
        return this.prisma.room.create({
            data: {
                roomNumber: dto.roomNumber,
                floor: dto.floor,
                area: dto.area,
                roomTypeId: dto.roomTypeId,
            },
        });
    }

    async findAllRooms(propertyId: string) {
        return this.prisma.room.findMany({
            where: { roomType: { propertyId } },
            include: { roomType: true },
            orderBy: [
                { roomType: { sortOrder: 'asc' } },
                { roomNumber: 'asc' }
            ]
        });
    }

    async updateRoom(id: string, dto: UpdateRoomDto) {
        const room = await this.prisma.room.findUnique({ where: { id } });
        if (!room) throw new NotFoundException('Phòng không tồn tại');

        return this.prisma.room.update({
            where: { id },
            data: dto as any,
        });
    }

    async deleteRoom(id: string) {
        const room = await this.prisma.room.findUnique({ where: { id } });
        if (!room) throw new NotFoundException('Phòng không tồn tại');
        return this.prisma.room.delete({ where: { id } });
    }

    // ===== Rate Plans =====

    async findRatePlans(roomTypeId: string) {
        return this.prisma.ratePlan.findMany({
            where: { roomTypeId },
            orderBy: { isDefault: 'desc' },
        });
    }

    async createRatePlan(roomTypeId: string, dto: CreateRatePlanDto) {
        return this.prisma.ratePlan.create({
            data: {
                name: dto.name,
                basePrice: dto.basePrice,
                weekendPrice: dto.weekendPrice,
                isDefault: dto.isDefault ?? false,
                roomTypeId,
            },
        });
    }

    async deleteRatePlan(id: string) {
        return this.prisma.ratePlan.delete({ where: { id } });
    }
}
