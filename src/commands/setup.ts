import { ApplicationCommandOptionType, CommandInteraction } from 'discord.js';
import { Discord, Slash, SlashChoice, SlashOption } from 'discordx';
import prisma from '../lib/prisma';
import { ethers } from 'ethers';
import { PreferredChain, Token } from '@prisma/client';

@Discord()
export class Setup {
  @Slash({
    description: 'Setup your wallet',
    name: 'setup'
  })
  async setup(
    @SlashChoice('MUMBAI', 'FUJI', 'GOERLI')
    @SlashOption({
      description: 'Preferred Chain for receving tokens',
      name: 'chain',
      required: true,
      type: ApplicationCommandOptionType.String
    })
    chain: string,
    @SlashChoice('USDC', 'NATIVE')
    @SlashOption({
      description: 'Preferred Token for receving tokens',
      name: 'token',
      required: true,
      type: ApplicationCommandOptionType.String
    })
    token: string,
    interaction: CommandInteraction
  ): Promise<void> {
    const user = await prisma.user.findUnique({
      where: {
        discordId: interaction.user.id
      }
    });

    if (user) {
      await interaction.reply({
        content: 'You already have a wallet!',
        ephemeral: true
      });
      return;
    }

    const randomWallet = ethers.Wallet.createRandom();

    await prisma.user.create({
      data: {
        discordId: interaction.user.id,
        preferredChain: chain as PreferredChain,
        preferredToken: token as Token,
        privateKey: randomWallet.privateKey
      }
    });

    await interaction.reply({
      content: `Your wallet address is ${randomWallet.address}`,
      ephemeral: true
    });
  }
}
