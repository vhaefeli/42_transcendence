import { Controller, Get } from '@nestjs/common';
import { Public } from './auth/auth.guard';

@Controller()
export class AppController {
  @Public()
  @Get()
  getHello() {
    return JSON.stringify(
      {
        project: 'ft_transcendence',
        team: [
          { name: 'Davi' },
          { name: 'Michèle' },
          { name: 'Nadia' },
          { name: 'Valérie' },
          { name: 'Vanessa' },
        ],
      },
      null,
      4,
    );
  }
}
