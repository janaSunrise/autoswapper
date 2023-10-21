import {
  ApplicationCommandOptionType,
  CommandInteraction,
  User
} from 'discord.js';
import { Discord, Slash, SlashChoice, SlashOption } from 'discordx';
import { checkAndSetAllowance, getProtocolQuote, initializeRouterProtocol } from '../lib/protocol';
import prisma from '../lib/prisma';
import { ethers } from 'ethers';

@Discord()
export class Transfer {
  @Slash({
    description: 'Transfer a token from one chain to another',
    name: 'transfer'
    // amountAddress
    // fromToken
  })
  async transfer(
    @SlashOption({
      description: 'User you want to transfer to',
      name: 'receiver',
      required: true,
      type: ApplicationCommandOptionType.User
    })
    receiver: User,
    @SlashChoice('USDC', 'NATIVE')
    @SlashOption({
      description: 'Token you want to transfer',
      name: 'token',
      required: true,
      type: ApplicationCommandOptionType.String
    })
    token: string,
    @SlashOption({
      description: 'Amount of the token you want to transfer',
      name: 'amount',
      required: true,
      type: ApplicationCommandOptionType.Number
    })
    amount: number,
    interaction: CommandInteraction
  ) {
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

    const receiverUser = await prisma.user.findUnique({
      where: {
        discordId: receiver.id
      }
    });

    if (!receiverUser) {
      await interaction.reply({
        content: 'Receiver does not have a wallet setup!',
        ephemeral: true
      });
      return;
    }

    const { protocol, provider } = await initializeRouterProtocol();

    const userWallet = new ethers.Wallet(user.privateKey);
    const receiverWalletAddress = new ethers.Wallet(receiverUser.privateKey)
      .address;

    const {quote, args} = await getProtocolQuote({
      amount,
      fromAddress: userWallet.address,
      fromToken: user
    });

    await checkAndSetAllowance({
      provider,
      protocol,
      args,
      privateKey: user.privateKey
    });

    let tx;
    try {
      tx = await protocol.swap(quote, userWallet as any)
      console.log(`Transaction successfully completed. Tx hash: ${tx.hash}`)
    }
    catch (e) {
      console.log(`Transaction failed with error ${e}`)
      await interaction.reply({
        content: `Transaction failed with error ${e}`,
        ephemeral: true
      });
    }
  }
}
