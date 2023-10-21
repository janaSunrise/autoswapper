import { ArgsOf, Client, Discord, On } from 'discordx';

@Discord()
export class Events {
  @On({ event: 'messageCreate' })
  onMessage(
    [message]: ArgsOf<'messageCreate'>,
    client: Client,
    guardPayload: any
  ) {
    console.log(message.content);
  }
}
