package ru.vlsu.ispi.lr3.ui.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import ru.vlsu.ispi.lr3.R
import ru.vlsu.ispi.lr3.models.HistoricalEvent
import ru.vlsu.ispi.lr3.models.checkAnswer
import ru.vlsu.ispi.lr3.ui.composable.FinishCard
import ru.vlsu.ispi.lr3.ui.composable.InfoCard
import ru.vlsu.ispi.lr3.ui.composable.StatusCard
import java.time.LocalDate
import java.util.UUID

val historicalEvents = listOf(
	HistoricalEvent(
		UUID.randomUUID(),
		"Первый трехцветный светофор",
		LocalDate.of(1920, 1, 1),
		R.drawable.image1,
		"Детройт, США"
	),
	HistoricalEvent(
		UUID.randomUUID(),
		"Открытие групп крови",
		LocalDate.of(1901, 1, 1),
		R.drawable.image2,
		"Вена, Австро-Венгрия"
	),
	HistoricalEvent(
		UUID.randomUUID(),
		"Открытие Антарктиды",
		LocalDate.of(1820, 1, 28),
		R.drawable.image3,
		null
	),
	HistoricalEvent(
		UUID.randomUUID(),
		"Первый экспериментальный автомобиль-трицикл",
		LocalDate.of(1886, 1, 29),
		R.drawable.image4,
		"Мангейм, Германия"
	),
	HistoricalEvent(
		UUID.randomUUID(),
		"Первый в мире ядерный реактор",
		LocalDate.of(1942, 12, 1),
		R.drawable.image5,
		"Чикаго, США"
	),
	HistoricalEvent(
		UUID.randomUUID(),
		"Открытие нейтрона",
		LocalDate.of(1932, 2, 27),
		R.drawable.image6,
		"Кембридж, Великобритания"
	),
	HistoricalEvent(
		UUID.randomUUID(),
		"Полёт первого человека в космос",
		LocalDate.of(1961, 4, 12),
		R.drawable.image7,
		"Байконур, СССР"
	),
	HistoricalEvent(
		UUID.randomUUID(),
		"Открытие пенициллина",
		LocalDate.of(1928, 9, 28),
		R.drawable.image8,
		"Лондон, Великобритания"
	),
	HistoricalEvent(
		UUID.randomUUID(),
		"Высадка на Луну",
		LocalDate.of(1969, 7, 20),
		R.drawable.image9,
		"Море Спокойствия, Луна"
	)
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SwipeScreen() {
	var currentIndex by remember { mutableIntStateOf(0) }
	var currentEvent: HistoricalEvent?

	var lastStatus: Boolean? by remember { mutableStateOf(null) }
	var prevEvent: HistoricalEvent? by remember { mutableStateOf(null) }

	var userInput by remember { mutableStateOf("") }
	var currentTolerance by remember { mutableFloatStateOf(10f) }
	var correctAnswersCount by remember { mutableIntStateOf(0) }

	Scaffold(
		topBar = {
			TopAppBar(title = { Text("Таймлайн") })
		}) { innerPadding ->
		Column(
			modifier = Modifier.padding(innerPadding),
			verticalArrangement = Arrangement.Center
		) {
			Box(modifier = Modifier.padding(PaddingValues(vertical = 12.dp, horizontal = 20.dp))) {
				StatusCard(lastStatus, prevEvent)
			}

			Box(modifier = Modifier.padding(PaddingValues(horizontal = 20.dp))) {
				InfoCard(correctAnswersCount, currentTolerance)
			}

			Box(modifier = Modifier.padding(PaddingValues(horizontal = 20.dp, vertical = 12.dp))) {
				Column {
					OutlinedTextField(
						value = userInput,
						onValueChange = { userInput = it },
						label = { Text("Введите год события") },
						modifier = Modifier.fillMaxWidth(),
						keyboardOptions = KeyboardOptions.Default.copy(
							keyboardType = KeyboardType.Number
						)
					)

					Spacer(modifier = Modifier.padding(vertical = 8.dp))

					Button(
						onClick = {
							if (userInput.isNotBlank()) {
								val inputYear = userInput.toIntOrNull()
								val currentEvent = historicalEvents.getOrNull(currentIndex)

								if (inputYear != null && currentEvent != null) {
									val isCorrect = currentEvent.checkAnswer(inputYear, currentTolerance)

									lastStatus = isCorrect
									prevEvent = currentEvent

									if (isCorrect) {
										correctAnswersCount++
										currentTolerance *= 0.9f
									}

									currentIndex++
									userInput = ""
								}
							}
						},
						modifier = Modifier.fillMaxWidth(),
						enabled = userInput.isNotBlank() && currentIndex < historicalEvents.size
					) {
						Text("Проверить ответ")
					}
				}
			}

			if (currentIndex >= historicalEvents.size) {
				Box(modifier = Modifier.padding(PaddingValues(horizontal = 20.dp))) {
					FinishCard(correctAnswersCount)
				}
			} else {
				currentEvent = historicalEvents[currentIndex]

				Box(
					modifier = Modifier
						.fillMaxWidth()
						.padding(16.dp)
				) {
					Card(
						shape = RoundedCornerShape(16.dp),
						modifier = Modifier
							.width(300.dp)
							.height(500.dp)
							.align(Alignment.Center)
					) {
						Column(
							modifier = Modifier.padding(16.dp)
						) {
							Image(
								painter = painterResource(id = currentEvent.imageResource),
								contentDescription = currentEvent.title,
								contentScale = ContentScale.Fit,
								modifier = Modifier
									.height(250.dp)
									.fillMaxWidth()
							)

							Spacer(modifier = Modifier.height(12.dp))

							Text(
								text = currentEvent.title,
								style = MaterialTheme.typography.headlineSmall
							)

							Spacer(modifier = Modifier.height(8.dp))

							if (currentEvent.location != null) {
								Text(
									text = "Место: ${currentEvent.location!!}",
									style = MaterialTheme.typography.bodyMedium,
									color = MaterialTheme.colorScheme.primary
								)

								Spacer(modifier = Modifier.height(12.dp))
							}

							Text(
								text = "Событие ${currentIndex + 1}/${historicalEvents.size}",
								style = MaterialTheme.typography.bodySmall,
								color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
							)
						}
					}
				}
			}
		}
	}
}
