package ru.vlsu.ispi.lr3.models

import java.time.LocalDate
import java.util.UUID
import kotlin.math.abs

data class HistoricalEvent(
	val id: UUID,
	val title: String,
	val date: LocalDate,
	val imageResource: Int,
	val location: String? = null
)

fun HistoricalEvent.checkAnswer(inputYear: Int, tolerance: Float): Boolean {
	return abs(this.date.year - inputYear) <= tolerance
}
