import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async create(email: string, password: string, role: 'ADMIN' | 'VIEWER' = 'VIEWER') {
    const passwordHash = await bcrypt.hash(password, 12);
    return this.prisma.user.create({ data: { email, passwordHash, role } });
  }
}
