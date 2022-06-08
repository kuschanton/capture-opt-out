// Imports global types
import '@twilio-labs/serverless-runtime-types'
// Fetches specific types
import {
  Context,
  ServerlessCallback,
  ServerlessFunctionSignature,
} from '@twilio-labs/serverless-runtime-types/types'

type InboundMessage = {
  Body: string,
  From: string
}

type OptOutContext = {
  SYNC_SERVICE_SID: string,
  SYNC_MAP_SID: string
}

const optOutWords = new Set<string>([
  'stop',
  'cancel',
  'end',
  'quit',
  'unsubscribe',
  'stopall',
])

const optInWords = new Set<string>([
  'start',
  'yes',
  'unstop',
])

export const handler: ServerlessFunctionSignature<OptOutContext, InboundMessage> = function (
  context: Context<OptOutContext>,
  event: InboundMessage,
  callback: ServerlessCallback,
) {

  // Response object
  const response = new Twilio.twiml.MessagingResponse()

  if (optOutWords.has(event.Body.trim().toLowerCase())) {
    console.log('We\'ve got opt-out', event)

    context.getTwilioClient()
      .sync
      .services(context.SYNC_SERVICE_SID)
      .syncMaps(context.SYNC_MAP_SID)
      .syncMapItems
      .create({
        key: event.From,
        data: {},
      })
      .then(_ => {
        console.log('Successfully stored map item')
        callback(null, response)
      })
      .catch(err => {
          console.log(err)
          callback(null, response)
        },
      )
  } else if (optInWords.has(event.Body.trim().toLowerCase())) {
    console.log('We\'ve got opt-in', event)
    context.getTwilioClient()
      .sync
      .services(context.SYNC_SERVICE_SID)
      .syncMaps(context.SYNC_MAP_SID)
      .syncMapItems(event.From)
      .remove()
      .then(_ => {
        console.log('Successfully removed map item')
        callback(null, response)
      })
      .catch(err => {
          console.log(err)
          callback(null, response)
        },
      )
  } else {
    callback(null, response)
  }
}