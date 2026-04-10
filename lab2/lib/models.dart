abstract class ListItem {
  final String? title;

  ListItem({this.title});
}

class HeadingItem extends ListItem {
  HeadingItem(String title) : super(title: title);
}

class MessageItem extends ListItem {
  final String description;

  MessageItem({required String title, this.description = ''})
      : super(title: title);
}
