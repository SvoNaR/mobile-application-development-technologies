import 'package:flutter/material.dart';

import 'models.dart';

/// Экран 2 — список по образцу из отчёта + требования методички:
/// CustomScrollView, SliverAppBar, physics, FAB, InkWell + диалог.
class ListScreen extends StatefulWidget {
  const ListScreen({super.key});

  @override
  State<ListScreen> createState() => _ListScreenState();
}

class _ListScreenState extends State<ListScreen> with TickerProviderStateMixin {
  final List<ListItem> items = [];
  int _counter = 0;

  late final TabController _tabController;

  static const String _headerImageUrl = 'https://picsum.photos/1200/400';

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _tabController.addListener(() {
      setState(() {});
    });
    _addInitialItems();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  void _addInitialItems() {
    for (int i = 0; i < 10; i++) {
      if (i % 5 == 0) {
        items.add(HeadingItem('Заголовок $i'));
      } else {
        items.add(
          MessageItem(
            title: 'Сообщение $_counter',
            description: 'Текст для строки',
          ),
        );
        _counter++;
      }
    }
  }

  void _addNewItem() {
    setState(() {
      final i = items.length;
      if (i % 5 == 0) {
        items.add(HeadingItem('Новый заголовок'));
      } else {
        items.add(
          MessageItem(
            title: 'Сообщение $_counter',
            description: 'Текст со списка',
          ),
        );
        _counter++;
      }
    });
  }

  void _showItemDialog(String title, String subtitle) {
    showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(title),
        content: Text(subtitle),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: const Icon(Icons.school_outlined),
        title: const Text('Разнообразный список + FAB'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(icon: Icon(Icons.view_list), text: 'Список'),
            Tab(icon: Icon(Icons.info_outline), text: 'Сведения'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildListTab(context),
          _buildInfoTab(context),
        ],
      ),
      floatingActionButton: _tabController.index == 0
          ? FloatingActionButton(
              onPressed: _addNewItem,
              tooltip: 'Добавить элемент',
              child: const Icon(Icons.add),
            )
          : null,
    );
  }

  Widget _buildInfoTab(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Лабораторная работа №2',
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: 8),
          const Text('Студент: Смирнов Григорий, группа ПРИ-122.'),
          const SizedBox(height: 8),
          const Text('Дисциплина: технологии разработки мобильных приложений.'),
          const SizedBox(height: 8),
          const Text(
            'Второй раздел TabBar: отдельная прокрутка от экрана со списком.',
          ),
        ],
      ),
    );
  }

  Widget _buildListTab(BuildContext context) {
    if (items.isEmpty) {
      return const Center(child: Text('Нажмите + для добавления'));
    }

    return CustomScrollView(
      physics: const BouncingScrollPhysics(
        parent: AlwaysScrollableScrollPhysics(),
      ),
      slivers: [
        SliverAppBar(
          pinned: true,
          expandedHeight: 200,
          flexibleSpace: FlexibleSpaceBar(
            title: const Text('Раздел списка'),
            background: Image.network(
              _headerImageUrl,
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => Container(
                color: Colors.blueGrey.shade100,
                alignment: Alignment.center,
                child: const Icon(Icons.landscape, size: 64),
              ),
            ),
          ),
        ),
        SliverList(
          delegate: SliverChildBuilderDelegate(
            (context, index) {
              final item = items[index];
              final key = ValueKey<int>(index);

              if (item is HeadingItem) {
                final title = item.title ?? '';
                return InkWell(
                  key: key,
                  onTap: () => _showItemDialog('Заголовок', title),
                  child: ListTile(
                    leading: const Icon(Icons.title, color: Colors.blue),
                    title: Text(
                      title,
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                  ),
                );
              }
              if (item is MessageItem) {
                final title = item.title ?? '';
                return InkWell(
                  key: key,
                  onTap: () =>
                      _showItemDialog(title, item.description),
                  child: ListTile(
                    leading: const Icon(Icons.message),
                    title: Text(title),
                    subtitle: Text(item.description),
                  ),
                );
              }
              return const SizedBox.shrink();
            },
            childCount: items.length,
            findChildIndexCallback: (Key key) {
              if (key is ValueKey<int>) {
                return key.value;
              }
              return null;
            },
          ),
        ),
      ],
    );
  }
}
