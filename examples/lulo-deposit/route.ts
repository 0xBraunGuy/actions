import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import {
  actionSpecOpenApiPostRequestBody,
  actionsSpecOpenApiGetResponse,
  actionsSpecOpenApiPostResponse,
} from '../openapi';
import {
  ActionsSpecErrorResponse,
  ActionsSpecGetResponse,
  ActionsSpecPostRequestBody,
  ActionsSpecPostResponse,
} from '../../spec/actions-spec';

const DEPOSIT_USDC_OPTIONS = [100, 1000];

const app = new OpenAPIHono();

app.openapi(
  createRoute({
    method: 'get',
    path: '/',
    tags: ['Deposit'],
    responses: actionsSpecOpenApiGetResponse,
  }),
  (c) => {

    const amountParameterName = 'amount';
    const response: ActionsSpecGetResponse = {
      icon: 'https://www.lulo.fi/android-chrome-512x512.png',
      label: `100 USDC`,
      title: 'Your Defi Savings Account',
      description: 'Deposit and begin earning today',
      links: {
        actions: [
          ...DEPOSIT_USDC_OPTIONS.map((amount) => ({
            label: `${amount} USDC`,
            href: `/api/lulo/deposit/${amount}`,
          })),
          {
            href: `/api/lulo/deposit/{${amountParameterName}}`,
            label: 'Deposit',
            parameters: [
              {
                name: amountParameterName,
                label: 'Enter a custom USDC amount',
              },
            ],
          },
        ],
      },
    };

    return c.json(response, 200);
  },
);

app.openapi(
    createRoute({
      method: 'post',
      path: '/{amount}',
      tags: ['Deposit'],
      request: {
        params: z.object({
          amount: z
            .string()
            .optional()
            .openapi({
              param: {
                name: 'amount',
                in: 'path',
                required: false,
              },
              type: 'number',
              example: '100',
            }),
        }),
        body: actionSpecOpenApiPostRequestBody,
      },
      responses: actionsSpecOpenApiPostResponse,
    }),
    async (c) => {
      const amount =
        c.req.param('amount') ?? DEPOSIT_USDC_OPTIONS[0].toString();
      const { account } = (await c.req.json()) as ActionsSpecPostRequestBody;

    const body = {
        owner: account,
        depositAmount: Number(amount),
        mintAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        estimateResponse: undefined,
    }


    console.log(`fetching`, body)

      const response = await fetch(`https://api.flexlend.fi/generate/account/deposit?priorityFee=100000`, 					{
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    },)

    const {data}: any = await response.json()

    console.log(data)

    const {transactionMeta} = data

    const transactions = transactionMeta as any[]


      const result: ActionsSpecPostResponse = {
        transaction: transactions[0].transaction,
        redirect: 'https://lulo.fi' 
      };
      return c.json(result, 200);
    },
  );


export default app;