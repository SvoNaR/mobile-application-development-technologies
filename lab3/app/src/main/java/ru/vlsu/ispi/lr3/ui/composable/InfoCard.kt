package ru.vlsu.ispi.lr3.ui.composable

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun InfoCard(correctAnswersCount: Int, currentTolerance: Float) {
	Card(
		shape = RoundedCornerShape(8.dp),
		modifier = Modifier.fillMaxWidth()
	) {
		Column(modifier = Modifier.padding(12.dp)) {
			Text(
				text = "Правильных ответов: $correctAnswersCount",
				style = MaterialTheme.typography.bodyMedium
			)
			Text(
				text = "Погрешность: ±${currentTolerance.toInt()} лет",
				style = MaterialTheme.typography.titleMedium
			)
		}
	}
}
