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
import ru.vlsu.ispi.lr3.ui.screens.historicalEvents

@Composable
fun FinishCard(correctAnswersCount: Int) {
	Card(
		shape = RoundedCornerShape(16.dp),
		modifier = Modifier.fillMaxWidth()
	) {
		Column(modifier = Modifier.padding(16.dp)) {
			Text(
				text = "Игра завершена!",
				style = MaterialTheme.typography.headlineMedium
			)
			Text(
				text = "Правильных ответов: $correctAnswersCount из ${historicalEvents.size}",
				style = MaterialTheme.typography.bodyLarge
			)
		}
	}
}
