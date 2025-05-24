import {
  Controller,
  Get,
  Post,
  Body,
  Res,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { SendMessageDto } from './dto/send-message.dto';
import { Response } from 'express';
// Hapus impor Swagger di bawah ini
// import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

// Hapus @ApiTags di bawah ini
// @ApiTags('WhatsApp')
@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly _whatsappService: WhatsappService) {} // Perbaikan di sini

  @Get('qr-code')
  async getQrCode(@Res() res: Response) {
    if (this._whatsappService.isReady()) {
      // Perbaikan di sini
      return res.status(HttpStatus.NO_CONTENT).send();
    }
    const qrDataUrl = this._whatsappService.getQrCodeDataUrl(); // Perbaikan di sini
    if (qrDataUrl) {
      return res.status(HttpStatus.OK).json({
        message: 'QR code available. Please scan.',
        qrDataUrl: qrDataUrl,
      });
    } else {
      return res.status(HttpStatus.OK).json({
        message: 'QR code not available yet. Please wait or check logs.',
      });
    }
  }

  @Get('status')
  getStatus() {
    const status = this._whatsappService.getConnectionStatus(); // Perbaikan di sini
    if (status.isReady && status.connectedNumber) {
      return {
        statusCode: HttpStatus.OK,
        message: 'WhatsApp client is ready.',
        data: {
          isReady: status.isReady,
          connectedNumber: status.connectedNumber,
        },
      };
    }
    if (!status.isReady && status.qrCodeUrl) {
      return {
        statusCode: HttpStatus.OK,
        message: 'WhatsApp client is not ready. Scan QR Code.',
        data: {
          isReady: status.isReady,
          qrCodeUrl: status.qrCodeUrl,
          connectedNumber: null,
        },
      };
    }
    return {
      statusCode: HttpStatus.OK,
      message:
        'WhatsApp client is initializing or disconnected. Check logs or try getting QR code.',
      data: {
        isReady: status.isReady,
        connectedNumber: null,
      },
    };
  }

  @Post('send-message')
  async sendMessage(@Body() sendMessageDto: SendMessageDto) {
    if (!this._whatsappService.isReady()) {
      // Perbaikan di sini
      throw new HttpException(
        'WhatsApp client is not ready. Please scan the QR code first.',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const sentMessage = await this._whatsappService.sendMessage(
        // Perbaikan di sini
        sendMessageDto.to,
        sendMessageDto.message,
      );
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Message sent successfully',
        data: sentMessage,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to send message',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
