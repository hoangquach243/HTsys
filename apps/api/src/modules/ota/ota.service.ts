import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOtaChannelDto, UpdateOtaChannelDto, CreateOtaMappingDto, OtaWebhookDto } from './dto/ota.dto';

@Injectable()
export class OtaService {
    private readonly logger = new Logger(OtaService.name);

    constructor(private prisma: PrismaService) { }

    // ===== OTA CHANNELS =====
    findAllChannels(propertyId: string) {
        return this.prisma.otaChannel.findMany({
            where: { propertyId },
            include: {
                _count: { select: { otaMappings: true, syncLogs: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async findChannelById(id: string) {
        const channel = await this.prisma.otaChannel.findUnique({
            where: { id },
            include: { otaMappings: { include: { roomType: true } } }
        });
        if (!channel) throw new NotFoundException('OTA Channel not found');
        return channel;
    }

    createChannel(dto: CreateOtaChannelDto) {
        return this.prisma.otaChannel.create({
            data: {
                name: dto.name,
                type: dto.type,
                credentials: dto.credentials || {},
                isActive: dto.isActive !== undefined ? dto.isActive : false,
                propertyId: dto.propertyId
            }
        });
    }

    async updateChannel(id: string, dto: UpdateOtaChannelDto) {
        await this.findChannelById(id);
        return this.prisma.otaChannel.update({
            where: { id },
            data: dto
        });
    }

    async deleteChannel(id: string) {
        await this.findChannelById(id);
        return this.prisma.otaChannel.delete({ where: { id } });
    }

    // ===== OTA MAPPINGS =====
    createMapping(dto: CreateOtaMappingDto) {
        return this.prisma.otaMapping.create({
            data: {
                channelId: dto.channelId,
                roomTypeId: dto.roomTypeId,
                externalRoomId: dto.externalRoomId,
                externalRateId: dto.externalRateId
            }
        });
    }

    async deleteMapping(id: string) {
        return this.prisma.otaMapping.delete({ where: { id } });
    }

    // ===== SYNC LOGS =====
    getSyncLogs(channelId: string, limit = 50) {
        return this.prisma.syncLog.findMany({
            where: { channelId },
            orderBy: { timestamp: 'desc' },
            take: limit
        });
    }

    // ===== WEBHOOK HANDLER (MOCK) =====
    async processWebhook(payload: OtaWebhookDto) {
        this.logger.log(`Received webhook from ${payload.channelType} for reservation ${payload.reservationId}`);

        // 1. Find the channel by type and hotelId (in credentials)
        // For mock purposes, we just find the first active channel of that type
        const channel = await this.prisma.otaChannel.findFirst({
            where: { type: payload.channelType, isActive: true }
        });

        if (!channel) {
            this.logger.warn(`No active channel found for type ${payload.channelType}`);
            throw new BadRequestException('Integration not configured');
        }

        //Log the incoming sync
        const syncLog = await this.prisma.syncLog.create({
            data: {
                channelId: channel.id,
                action: `WEBHOOK_${payload.status}`,
                direction: 'PULL',
                status: 'PENDING',
                details: payload as any
            }
        });

        try {
            // 2. Find mapping and property
            const mapping = await this.prisma.otaMapping.findFirst({
                where: { channelId: channel.id, externalRoomId: payload.externalRoomId },
                include: { roomType: true }
            });

            if (!mapping) {
                throw new Error(`Room mapping not found for externalRoomId: ${payload.externalRoomId}`);
            }

            // 3. Process Booking (Simplified mock logic: just log success)
            // In a real scenario, this creates a Guest and a Booking in the DB.

            this.logger.log(`Processed mapping: internal RoomType ${mapping.roomType.name}`);

            // Update sync log success
            await this.prisma.syncLog.update({
                where: { id: syncLog.id },
                data: { status: 'SUCCESS', duration: 150 }
            });

            return { success: true, message: 'Webhook processed' };

        } catch (error: any) {
            // Update sync log failure
            await this.prisma.syncLog.update({
                where: { id: syncLog.id },
                data: { status: 'FAILED', details: { error: error.message, payload } as any, duration: 50 }
            });
            this.logger.error(`Webhook processing failed: ${error.message}`);
            throw new BadRequestException(error.message);
        }
    }
}
