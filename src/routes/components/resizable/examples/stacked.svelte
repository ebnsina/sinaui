<script lang="ts">
	import * as Resizable from '#lib/ui/resizable/index.js';
</script>

<div class="frame">
	<Resizable.Group orientation="vertical">
		<Resizable.Panel minSize={25} label="Text">
			<div class="pane">
				<p>
					The Compendious Book on Calculation by Completion and Balancing, written by al-Khwarizmi
					in Baghdad around 820, gave algebra its name.
				</p>
			</div>
		</Resizable.Panel>
		<Resizable.Handle label="Resize the text" />
		<Resizable.Panel minSize={25} label="Commentary">
			<div class="pane">
				<p>“Completion” is al-jabr: moving a subtracted term to the other side of the equation.</p>
			</div>
		</Resizable.Panel>
	</Resizable.Group>
</div>

<style>
	.frame {
		inline-size: 100%;
		block-size: 14rem;
		border-radius: calc(var(--ui-radius) + 0.25rem);
		background: var(--ui-surface);
		border: 1px solid var(--ui-field-line);
		overflow: hidden;
	}
	.pane {
		padding: 1rem;
		font-size: 0.9375rem;
		line-height: 1.7;
	}
	p {
		margin: 0;
	}
</style>
