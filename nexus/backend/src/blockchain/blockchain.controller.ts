import { Controller, Get, Param } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';

@Controller('api/blockchain')
export class BlockchainController {
  constructor(private readonly blockchainService: BlockchainService) {}

  @Get('balance/:address')
  async getBalance(@Param('address') address: string): Promise<{ balance: number }> {
    const balance = await this.blockchainService.getBalance(address);
    return { balance };
  }

  @Get('total-supply')
  async getTotalSupply(): Promise<{ totalSupply: number }> {
    const totalSupply = await this.blockchainService.getTotalSupply();
    return { totalSupply };
  }

  @Get('transaction/:txHash')
  async getTransaction(@Param('txHash') txHash: string) {
    const tx = await this.blockchainService.getTransaction(txHash);
    if (!tx) {
      return { error: 'Transaction not found' };
    }
    return {
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: tx.value.toString(),
      blockNumber: tx.blockNumber,
    };
  }
}









