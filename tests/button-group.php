<h1>Button Group</h1>

<?php unset($shapes['oval']);

$effects = array(
	'button-group-vertical' => 'Vertical'
);

foreach ($shapes as $shape => $shapeTitle) { ?>

	<div class="example">
		<h2><?php echo $shapeTitle; ?></h2>

		<?php foreach ($types as $type => $typeTitle) { ?>

			<div class="row">

				<?php $count = 3;
				foreach ($sizes as $size => $sizeTitle) {
					$class = $shape . ' ' . $size;
					$title = $shapeTitle . ' ' . $sizeTitle; ?>

					<div class="button-group <?php echo $class; ?>">
						<?php for ($i = 0; $i <= $count; $i++) { ?>
							<a href="javascript:;" class="button <?php echo $type; ?>">Button <?php echo $i; ?></a>
						<?php } ?>
					</div>

				<?php $count--;
				} ?>

			</div>

		<?php } ?>
	</div>

<?php } ?>

<h1>Button Group: Effects</h1>

<?php // New shape
$shapes['skew-reverse'] = 'Skew Reverse';

foreach ($effects as $effect => $effectTitle) { ?>

	<div class="example">
		<h2><?php echo $effectTitle; ?></h2>

		<?php
		$t = 0;
		$typeClasses = array_keys($types);

		foreach ($shapes as $shape => $shapeTitle) {
			$classes = array($effect, $shape);

			foreach ($sizes as $size => $sizeTitle) {
				$class = implode(' ', $classes) . ' ' . $size;
				$title = $shapeTitle . ' ' . $sizeTitle;
				$count = rand(2, 8); ?>

				<div class="button-group <?php echo $class; ?>">
					<?php for ($i = 0; $i <= $count; $i++) { ?>
						<button type="button" class="button <?php echo $typeClasses[$t]; ?>"><?php echo $i; ?></button>
					<?php } ?>
				</div>

			<?php }
			$t++;
		} ?>

	</div>

<?php } ?>