import { PartialType } from '@nestjs/swagger';
import { CreateActionPlanDto } from './create-action-plan.dto';

export class UpdateActionPlanDto extends PartialType(CreateActionPlanDto) {}
