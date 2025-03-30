import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { format } from 'date-fns';
import { PrismaService } from '../../prisma/prisma.service';

type PriceInfo = {
  discount: number;
  finalPrice: number;
  originalPrice: number;
  currencyCode: string;
};

type PaxAvailabilityAPI = {
  max: number;
  min: number;
  remaining: number;
  type: string;
  isPrimary: boolean;
  description: string;
  name: string;
  price: PriceInfo;
};

type SlotResponse = {
  startDate: string;
  startTime: string;
  endTime: string;
  providerSlotId: string;
  remaining: number;
  currencyCode: string;
  variantId: number;
  paxAvailability: PaxAvailabilityAPI[];
};

@Injectable()
export class InventoryService {
  private readonly API_KEY = '78d85aa22872c2b8a1c9cc44c4f495a0';
  private readonly API_BASE = 'https://leap-api.tickete.co/api/v1/inventory';

  constructor(private prisma: PrismaService) {}

  async fetchAndStoreInventory(productId: number, date: Date) {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const url = `${this.API_BASE}/${productId}?date=${formattedDate}`;

    try {
      const response = await axios.get<SlotResponse[]>(url, {
        headers: {
          'x-api-key': this.API_KEY,
        },
      });

      const slots = response.data;

      for (const slot of slots) {
        const existingSlot = await this.prisma.slot.findUnique({
          where: { providerSlotId: slot.providerSlotId },
        });

        if (existingSlot) continue;

        const paxEntries: {
          type: string;
          name?: string;
          description?: string;
          min?: number;
          max?: number;
          remaining: number;
          priceId: number;
        }[] = [];

        for (const pax of slot.paxAvailability) {
          const price = await this.prisma.price.create({
            data: {
              finalPrice: pax.price.finalPrice,
              originalPrice: pax.price.originalPrice,
              currencyCode: pax.price.currencyCode,
            },
          });

          paxEntries.push({
            type: pax.type,
            name: pax.name,
            description: pax.description,
            min: pax.min,
            max: pax.max,
            remaining: pax.remaining,
            priceId: price.id,
          });
        }

        await this.prisma.slot.create({
          data: {
            productId,
            startDate: new Date(slot.startDate),
            startTime: slot.startTime,
            endTime: slot.endTime,
            providerSlotId: slot.providerSlotId,
            currencyCode: slot.currencyCode,
            variantId: slot.variantId,
            remaining: slot.remaining,
            paxAvailability: {
              create: paxEntries,
            },
          },
        });
      }

      Logger.log(`✅ Inventory synced for product ${productId} on ${formattedDate}`);
    } catch (error) {
      Logger.error(`❌ Error syncing inventory for product ${productId}: ${error.message}`);
    }
  }

  // ✅ GET /experience/:id/slots?date=YYYY-MM-DD
  async getSlotsByDate(productId: number, date: string) {
    const startOfDay = new Date(date + 'T00:00:00.000Z');

    const slots = await this.prisma.slot.findMany({
      where: {
        productId,
        startDate: startOfDay,
      },
      include: {
        paxAvailability: {
          include: {
            price: true,
          },
        },
      },
    });

    return slots.map((slot) => ({
      startTime: slot.startTime,
      startDate: slot.startDate.toISOString().split('T')[0],
      price: {
        finalPrice: slot.paxAvailability[0]?.price.finalPrice ?? 0,
        originalPrice: slot.paxAvailability[0]?.price.originalPrice ?? 0,
        currencyCode: slot.paxAvailability[0]?.price.currencyCode ?? 'SGD',
      },
      remaining: slot.remaining,
      paxAvailability: slot.paxAvailability.map((pax) => ({
        type: pax.type,
        name: pax.name,
        description: pax.description,
        min: pax.min,
        max: pax.max,
        remaining: pax.remaining,
        price: {
          finalPrice: pax.price.finalPrice,
          originalPrice: pax.price.originalPrice,
          currencyCode: pax.price.currencyCode,
        },
      })),
    }));
  }

  // ✅ GET /experience/:id/dates
  async getAvailableDates(productId: number) {
    const dates = await this.prisma.slot.findMany({
      where: { productId },
      select: {
        startDate: true,
        paxAvailability: {
          select: {
            price: {
              select: {
                finalPrice: true,
                originalPrice: true,
                currencyCode: true,
              },
            },
          },
          take: 1,
        },
      },
    });

    const grouped: { [key: string]: any } = {};

    for (const slot of dates) {
      const dateStr = slot.startDate.toISOString().split('T')[0];

      if (!grouped[dateStr]) {
        grouped[dateStr] = {
          date: dateStr,
          price: slot.paxAvailability[0]?.price ?? {
            finalPrice: 0,
            originalPrice: 0,
            currencyCode: 'SGD',
          },
        };
      }
    }

    return { dates: Object.values(grouped) };
  }
}
