DROP Table if exists `chat_log`;
CREATE Table `chat_log` (
  `id` int(11) PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `user_name` varchar(256) NOT NULL,
  `message` text NOT NULL,
  `send_time` datetime NOT NULL DEFAULT current_timestamp()
);

INSERT INTO `chat_log` (`user_name`, `message`) VALUES ('test', 'Hello World!');

SELECT * FROM chat_log ORDER by time desc;