import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DirectorsService } from './directors.service';
import { DirectorsController } from './directors.controller';
import { Director, DirectorSchema } from './director.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Director.name, schema: DirectorSchema },
    ]),
  ],
  controllers: [DirectorsController],
  providers: [DirectorsService],
})
export class DirectorsModule {}
