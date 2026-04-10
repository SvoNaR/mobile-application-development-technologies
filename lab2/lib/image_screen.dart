import 'package:flutter/material.dart';

/// Экран 1 — по образцу из отчёта (сеть картинка + кнопка обновления).
class ImageScreen extends StatefulWidget {
  const ImageScreen({super.key});

  @override
  State<ImageScreen> createState() => _ImageScreenState();
}

class _ImageScreenState extends State<ImageScreen> {
  String url = 'https://picsum.photos/800/600';

  void _changeImage() {
    setState(() {
      final t = DateTime.now().millisecondsSinceEpoch;
      url = 'https://picsum.photos/800/600?random=$t';
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Экран изображения')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text(
              'Нажмите кнопку для загрузки другого изображения',
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: _changeImage,
              child: const Text('Обновить изображение'),
            ),
            const SizedBox(height: 30),
            Container(
              width: double.infinity,
              height: 250,
              decoration: BoxDecoration(
                border: Border.all(color: Colors.grey.shade300),
                borderRadius: BorderRadius.circular(12),
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: Image.network(
                  url,
                  fit: BoxFit.cover,
                  loadingBuilder: (context, child, progress) {
                    if (progress == null) {
                      return child ?? const SizedBox.shrink();
                    }
                    return const Center(child: CircularProgressIndicator());
                  },
                  errorBuilder: (context, error, stackTrace) => const Center(
                    child: Text('Ошибка загрузки'),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
