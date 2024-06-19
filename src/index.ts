import { Hono } from 'hono';
import OpenAI from 'openai';

type Env = {
	AI: Ai;
	CLOUDFLARE_API_KEY: string;
	CLOUDFLARE_ACCOUNT_ID: string;
	OPENAI_API_KEY: string;
};

const app = new Hono<{ Bindings: Env }>();

app.get('/', async(c) => {
	return c.html(`
		<h1>Temporary Testing</h1>
		<h2>API calls</h2>
		<ul>
			<li><a href="/our-tool-calls" target="ours">Our Tool Calls</a></li>
			<li><a href="/their-tool-calls" target="theirs">OpenAI Tool Calls</a></li>
			<li><a href="/compat-tool-calls" target="compat">Compat Tool Calls</a></li>
		</ul>

		<h2>Resources</h2>
		<ul>
			<li><a href="https://github.com/craigsdennis/tmp-openai-compat-tools">This repo</a></li>
			<li><a href="https://platform.openai.com/docs/api-reference/chat/create#chat-create-tools">Their API docs</a></li>
		</ul>


    `);
})

app.get('/chat-completions', async (c) => {
	const openai = new OpenAI({
		apiKey: c.env.CLOUDFLARE_API_KEY,
		baseURL: `https://api.cloudflare.com/client/v4/accounts/${c.env.CLOUDFLARE_ACCOUNT_ID}/ai/v1`,
	});

	const chatCompletion = await openai.chat.completions.create({
		messages: [{ role: 'user', content: 'Make some robot noises' }],
		model: '@cf/meta/llama-3-8b-instruct',
	});
	return c.json(chatCompletion);
});

// https://platform.openai.com/docs/api-reference/chat/create#chat-create-tools

app.get('/our-tool-calls', async (c) => {
	const result = await c.env.AI.run('@hf/nousresearch/hermes-2-pro-mistral-7b', {
		messages: [{ role: 'user', content: 'Hype up the user HichaelMart' }],
		tools: [
			{
				name: 'hypeUp',
				description: 'Hypes up the user',
				parameters: {
					type: 'object',
					properties: {
						userName: {
							type: 'string',
							description: 'The user name that will be hyped up',
						},
					},
					required: ['userName'],
				},
			},
		],
	});
	return c.json(result);
});

app.get('/their-tool-calls', async(c) => {
	const openai = new OpenAI({
		apiKey: c.env.OPENAI_API_KEY
	});

	const chatCompletion = await openai.chat.completions.create({
		messages: [{ role: 'user', content: 'Hype up the user HichaelMart' }],
		model: 'gpt-4o',
		tools: [
			{
				type: 'function',
				function: {
					name: 'hypeUp',
					description: 'Hypes up the user',
					parameters: {
						type: 'object',
						properties: {
							userName: {
								type: 'string',
								description: 'The user name that will be hyped up',
							},
						},
						required: ['userName'],
					},
				},
			},
		],
	});
	return c.json(chatCompletion);
});

app.get('/compat-tool-calls', async (c) => {
	const openai = new OpenAI({
		apiKey: c.env.CLOUDFLARE_API_KEY,
		baseURL: `https://api.cloudflare.com/client/v4/accounts/${c.env.CLOUDFLARE_ACCOUNT_ID}/ai/v1`,
	});

	const chatCompletion = await openai.chat.completions.create({
		messages: [{ role: 'user', content: 'Hype up the user HichaelMart' }],
		model: '@hf/nousresearch/hermes-2-pro-mistral-7b',
		tools: [
			{
				type: 'function',
				function: {
					name: 'hypeUp',
					description: 'Hypes up the user',
					parameters: {
						type: 'object',
						properties: {
							userName: {
								type: 'string',
								description: 'The user name that will be hyped up',
							},
						},
						required: ['userName'],
					},
				},
			},
		],
	});
	return c.json(chatCompletion);
});

export default app;
