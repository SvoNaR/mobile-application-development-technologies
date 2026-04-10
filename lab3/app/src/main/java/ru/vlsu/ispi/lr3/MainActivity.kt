package ru.vlsu.ispi.lr3

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import ru.vlsu.ispi.lr3.ui.screens.SwipeScreen
import ru.vlsu.ispi.lr3.ui.theme.Lr3Theme

class MainActivity : ComponentActivity() {
	override fun onCreate(savedInstanceState: Bundle?) {
		super.onCreate(savedInstanceState)
		enableEdgeToEdge()
		setContent {
			Lr3Theme {
				SwipeScreen()
			}
		}
	}
}
