import {
  IsString,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ScopeDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  exclude_categories?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  exclude_tags?: string[];
}

export class CreateDelegationPolicyDto {
  @IsString()
  wallet: string;

  @IsString()
  agent_id: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ScopeDto)
  scope?: ScopeDto;

  @IsOptional()
  @IsNumber()
  max_budget_per_month?: number;

  @IsOptional()
  @IsNumber()
  max_budget_per_proposal?: number;

  @IsBoolean()
  no_vote_on_emergency: boolean;

  @IsNumber()
  cooldown_window_hours: number;

  @IsBoolean()
  veto_enabled: boolean;

  @IsOptional()
  @IsNumber()
  require_human_review_above?: number;

  @IsOptional()
  @IsNumber()
  max_votes_per_day?: number;
}




