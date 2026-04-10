package ru.vlsu.ispi.lr3.ui.composable

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Card
import androidx.compose.material3.CardColors
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import ru.vlsu.ispi.lr3.models.HistoricalEvent
import ru.vlsu.ispi.lr3.ui.theme.ErrorColor
import ru.vlsu.ispi.lr3.ui.theme.OnErrorColor
import ru.vlsu.ispi.lr3.ui.theme.OnSuccessColor
import ru.vlsu.ispi.lr3.ui.theme.SuccessColor

@Composable
fun StatusCard(lastStatus: Boolean?, lastEvent: HistoricalEvent?) {
	if (lastStatus == null) {
		return
	}

	Card(
		colors = CardColors(
			containerColor = if (lastStatus) SuccessColor else ErrorColor,
			contentColor = if (lastStatus) OnSuccessColor else OnErrorColor,
			disabledContainerColor = MaterialTheme.colorScheme.secondaryContainer,
			disabledContentColor = MaterialTheme.colorScheme.onSecondaryContainer
		),
		modifier = Modifier.fillMaxWidth()
	) {
		Column(
			modifier = Modifier.padding(PaddingValues(vertical = 12.dp, horizontal = 12.dp)),
		)
		{
			if (lastStatus) {
				Text(text = "Верно!", style = MaterialTheme.typography.headlineSmall)
			} else {
				Text(text = "Ошибка!", style = MaterialTheme.typography.headlineSmall)
			}
			if (lastEvent != null)
				Text(
					text = "Событие произошло в ${lastEvent.date.year} году (${lastEvent.location ?: "место не указано"})",
					style = MaterialTheme.typography.bodyLarge
				)
		}
	}
}
