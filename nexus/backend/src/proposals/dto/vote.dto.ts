import { IsString, IsIn, IsOptional } from 'class-validator';

export class VoteDto {
  @IsString()
  voterAddress: string;

  @IsIn(['yes', 'no', 'abstain'])
  choice: 'yes' | 'no' | 'abstain';

  @IsOptional()
  @IsString()
  txHash?: string;
}


