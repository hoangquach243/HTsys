import { Module } from '@nestjs/common';
import { OtaController } from './ota.controller';
import { OtaService } from './ota.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [OtaController],
  providers: [OtaService],
  exports: [OtaService]
})
export class OtaModule { }
