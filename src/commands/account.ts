import { CommandInteraction } from 'discord.js';
import { Discord, Slash } from 'discordx';
import prisma from '../lib/prisma';
import { Wallet, ethers } from 'ethers';

@Discord()
export class Account {
  @Slash({
    description: 'Get your account details',
    name: 'account'
  })
  async account(interaction: CommandInteraction) {
    const user = await prisma.user.findUnique({
      where: {
        discordId: interaction.user.id
      }
    });

    if (!user) {
      await interaction.reply({
        content:
          "You haven't setup your wallet yet! Run `/setup` to get started",
        ephemeral: true
      });
      return;
    }

    const walletAddress = new Wallet(user.privateKey).address;

    return await interaction.reply({
      content: `Your wallet address is ${walletAddress}`,
      ephemeral: true
    });
  }
}
