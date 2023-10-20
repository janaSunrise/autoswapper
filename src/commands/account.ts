import { CommandInteraction } from 'discord.js';
import { Discord, Slash } from 'discordx';
import prisma from '../lib/prisma';

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
  }
}
