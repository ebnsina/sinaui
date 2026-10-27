<script lang="ts">
	import Install from '#lib/site/Install.svelte';
	import type { Component } from 'svelte';
	import Code from '#lib/site/Code.svelte';
	import Example from '#lib/site/Example.svelte';
	import { examples } from '#lib/site/examples.js';
	import server from '#lib/blocks/chat/chat-endpoint.ts.txt?raw';
	import env from '#lib/blocks/chat/env.ts.txt?raw';

	const ex = examples(
		import.meta.glob<Component>('./examples/*.svelte', { eager: true, import: 'default' }),
		import.meta.glob<string>('./examples/*.svelte', {
			eager: true,
			query: '?raw',
			import: 'default'
		})
	);
</script>

<svelte:head>
	<title>AI chat — Sina UI</title>
	<meta name="description" content="A streaming AI chat with Claude, built on TanStack AI." />
	<meta property="og:title" content="AI chat — Sina UI" />
	<meta
		property="og:description"
		content="A streaming AI chat with Claude, built on TanStack AI."
	/>
</svelte:head>

<p class="eyebrow">Blocks</p>
<h1>AI chat</h1>
<p class="lede">
	A complete chat with an AI model: replies stream in, you can stop them, copy them, and start over.
</p>

<h2 id="examples">Examples</h2>
<Example
	id="librarian"
	title="Simple"
	description="This demo answers from a small script so it runs without a key; your app streams real replies from Claude. Scroll up while it writes and it leaves you there, with a button back down."
	{...ex('librarian')}
/>
<Example
	id="assistant"
	title="Assistant with history"
	description="Conversations are kept in this browser and listed by day; reload and they're still here. Attach images, audio, video or PDFs with the paperclip, by dropping them on the chat, or by pasting."
	{...ex('assistant')}
/>
<Example
	id="failure"
	title="When a reply is turned away"
	description="Your server says why in its own words, and the chat shows them with a link of yours beside it. Without failure, a dropped reply shows a general connection message. Send a question to see it."
	{...ex('failure')}
/>
<Example
	id="sheet"
	title="In a side sheet"
	description="fill makes the chat take its container's height, and bare drops its own card since the sheet is already one. The sheet is widened with --ui-sheet-width."
	{...ex('sheet')}
/>
<Example
	id="terminal"
	title="Terminal agent"
	description="An agent in a terminal: it thinks, calls tools and shows what each returned, then answers. Try “How did Ibn al-Haytham explain sight?”, then /help. Escape interrupts a run; Up brings back what you sent."
	{...ex('terminal')}
/>

<h2 id="installation">Installation</h2>
<Install names="blocks/chat">
	<p>
		Copy <code>src/lib/blocks/chat/</code>, and the <code>Button</code>, <code>Icon</code> and
		<code>announce.ts</code> it uses. Then install TanStack AI with its Anthropic adapter:
	</p>
	<Code
		code="pnpm add @tanstack/ai@0.63.0 @tanstack/ai-svelte@0.24.3 @tanstack/ai-anthropic@0.19.3"
		lang="shell"
		label="Install command"
	/>
	<p>
		These are early versions, so they're pinned exactly: a later one may change its API. Upgrade on
		purpose, one at a time.
	</p>
</Install>

<h3 id="endpoint">The endpoint</h3>
<p>Add a route that streams replies from Claude:</p>
<Code code={server} lang="ts" label="src/routes/api/chat/+server.ts" />

<h3 id="key">Your API key</h3>
<p>
	Declare the key, so the app refuses to start without it rather than showing a chat that never
	answers. Set <code>ANTHROPIC_API_KEY</code> in your environment.
</p>
<Code code={env} lang="ts" label="src/env.ts" />
<p>
	Then give the block its connection:
	<code>connection={'{'}fetchServerSentEvents('/api/chat')}</code>.
</p>

<h3 id="failure-message">Your server's words when a reply fails</h3>
<p>
	When your endpoint turns a question away (a plan limit, say) with a message written for people,
	read it in <code>fetchClient</code> and pass it as <code>failure</code>, as the example above
	does. Pass only copy your server wrote for people; it's shown word for word.
</p>

<h2 id="agents">Agents and tools</h2>
<p>
	To test an agent, start it with its greeting in <code>initialMessages</code> and show what it does
	through <code>tool</code>: the snippet gets the call (its <code>input</code> is set once the
	arguments are complete) and, when there is one, the result. <code>onfinish</code> tells you a
	reply is complete, to refresh what the agent recorded. A stream error keeps your server's
	<code>code</code>, so <code>onerror</code> can pick the words for <code>failure</code>.
</p>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr><td><code>connection</code></td><td>TanStack AI connection (required)</td><td></td></tr>
		<tr
			><td><code>assistantName</code></td><td
				><code>string</code>: what screen readers call the replies</td
			><td><code>'Assistant'</code></td></tr
		>
		<tr><td><code>title</code></td><td><code>string</code></td><td>the assistant's name</td></tr>
		<tr
			><td><code>suggestions</code></td><td><code>string[]</code>: questions offered when empty</td
			><td></td></tr
		>
		<tr
			><td><code>placeholder</code></td><td><code>string</code></td><td
				><code>'Ask anything…'</code></td
			></tr
		>
		<tr
			><td><code>failure</code></td><td
				><code>{'{ message: string }'}</code>: why the last reply failed, in your server's words</td
			><td></td></tr
		>
		<tr
			><td><code>failureActions</code></td><td
				><code>Snippet</code>: shown beside the failure message, such as a link</td
			><td></td></tr
		>
		<tr
			><td><code>threadId</code></td><td
				><code>string</code>: names the conversation for your server; kept across reloads with
				<code>persistence</code></td
			><td>one made up per chat</td></tr
		>
		<tr
			><td><code>initialMessages</code></td><td
				><code>UIMessage[]</code>: what the conversation opens with, such as a greeting</td
			><td></td></tr
		>
		<tr
			><td><code>tool</code></td><td
				><code>Snippet&lt;[ToolCallPart, ToolResultPart | undefined]&gt;</code>: shows a tool the
				assistant called; without it, tool calls stay hidden</td
			><td></td></tr
		>
		<tr
			><td><code>onfinish</code></td><td
				><code>(message: UIMessage) =&gt; void</code>: each reply, once it's complete</td
			><td></td></tr
		>
		<tr
			><td><code>onerror</code></td><td
				><code>(error: Error) =&gt; void</code>: a failed reply, with your server's
				<code>code</code>, to choose <code>failure</code></td
			><td></td></tr
		>
		<tr
			><td><code>attachments</code></td><td><code>boolean</code>: the paperclip, drop and paste</td
			><td><code>false</code>; <code>true</code> in <code>Assistant</code></td></tr
		>
		<tr
			><td><code>fill</code></td><td
				><code>boolean</code>: fill the container's height, such as a side sheet, instead of a 34rem
				card</td
			><td><code>false</code>; <code>true</code> in <code>Assistant</code></td></tr
		>
		<tr
			><td><code>bare</code></td><td
				><code>boolean</code>: no card of its own (corners, background, shadow), inside something
				that already provides the surface</td
			><td><code>false</code>; <code>true</code> in <code>Assistant</code></td></tr
		>
	</tbody>
</table>

<h2 id="keyboard">Keyboard</h2>
<table>
	<thead><tr><th>Key</th><th>Does</th></tr></thead>
	<tbody>
		<tr><td>Enter</td><td>Send</td></tr>
		<tr><td>Shift + Enter</td><td>A new line</td></tr>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>
		The conversation is a log: each reply is read once it's complete, never word by word as it
		streams.
	</li>
	<li>
		Stop, Copy, Retry and New chat are named buttons; Send says so, and is unavailable until there's
		something to send.
	</li>
	<li>A failed reply is announced, in plain words, with a way to try again.</li>
	<li>Each reply is labeled with the assistant's name, and so is the "is writing" indicator.</li>
	<li>With reduced motion, messages appear without rising and the typing dots slow down.</li>
</ul>
