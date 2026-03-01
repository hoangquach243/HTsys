import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
    UpdatePropertyDto,
    CreatePaymentMethodDto, UpdatePaymentMethodDto,
    CreateBankAccountDto, UpdateBankAccountDto,
    CreateBookingSourceDto, UpdateBookingSourceDto,
    CreateLabelDto, UpdateLabelDto
} from './dto/settings.dto';

@Injectable()
export class SettingsService {
    constructor(private prisma: PrismaService) { }

    // ===== PROPERTY INFO =====
    async getProperty(id: string) {
        const property = await this.prisma.property.findUnique({ where: { id } });
        if (!property) throw new NotFoundException('Property not found');
        return property;
    }

    async updateProperty(id: string, dto: UpdatePropertyDto) {
        await this.getProperty(id);
        return this.prisma.property.update({ where: { id }, data: dto });
    }

    // ===== PAYMENT METHODS =====
    getPaymentMethods(propertyId: string) {
        return this.prisma.paymentMethod.findMany({ where: { propertyId }, orderBy: { createdAt: 'asc' } });
    }

    createPaymentMethod(dto: CreatePaymentMethodDto) {
        return this.prisma.paymentMethod.create({ data: dto });
    }

    async updatePaymentMethod(id: string, dto: UpdatePaymentMethodDto) {
        return this.prisma.paymentMethod.update({ where: { id }, data: dto });
    }

    deletePaymentMethod(id: string) {
        return this.prisma.paymentMethod.delete({ where: { id } });
    }

    // ===== BANK ACCOUNTS =====
    getBankAccounts(propertyId: string) {
        return this.prisma.bankAccount.findMany({ where: { propertyId }, orderBy: { createdAt: 'asc' } });
    }

    async createBankAccount(dto: CreateBankAccountDto) {
        if (dto.isDefault) {
            await this.prisma.bankAccount.updateMany({
                where: { propertyId: dto.propertyId, isDefault: true },
                data: { isDefault: false }
            });
        }
        return this.prisma.bankAccount.create({ data: dto });
    }

    async updateBankAccount(id: string, dto: UpdateBankAccountDto) {
        const bankAccount = await this.prisma.bankAccount.findUnique({ where: { id } });
        if (!bankAccount) throw new NotFoundException('Bank account not found');

        if (dto.isDefault) {
            await this.prisma.bankAccount.updateMany({
                where: { propertyId: bankAccount.propertyId, isDefault: true, id: { not: id } },
                data: { isDefault: false }
            });
        }
        return this.prisma.bankAccount.update({ where: { id }, data: dto });
    }

    deleteBankAccount(id: string) {
        return this.prisma.bankAccount.delete({ where: { id } });
    }

    // ===== BOOKING SOURCES =====
    getBookingSources(propertyId: string) {
        return this.prisma.bookingSource.findMany({ where: { propertyId }, orderBy: { createdAt: 'asc' } });
    }

    createBookingSource(dto: CreateBookingSourceDto) {
        return this.prisma.bookingSource.create({ data: dto });
    }

    updateBookingSource(id: string, dto: UpdateBookingSourceDto) {
        return this.prisma.bookingSource.update({ where: { id }, data: dto });
    }

    deleteBookingSource(id: string) {
        return this.prisma.bookingSource.delete({ where: { id } });
    }

    // ===== LABELS =====
    getLabels(propertyId: string) {
        return this.prisma.label.findMany({ where: { propertyId }, orderBy: { name: 'asc' } });
    }

    createLabel(dto: CreateLabelDto) {
        return this.prisma.label.create({ data: dto });
    }

    updateLabel(id: string, dto: UpdateLabelDto) {
        return this.prisma.label.update({ where: { id }, data: dto });
    }

    deleteLabel(id: string) {
        return this.prisma.label.delete({ where: { id } });
    }
}
