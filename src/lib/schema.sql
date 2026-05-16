-- tables
create table if not exists channel_filters (
	guild_id varchar(20) not null,
	channel_id varchar(20) not null,
	max_age_seconds integer,
	text_filter text,
	delete_users text [] default '{}'::text [],
	delete_roles text [] default '{}'::text [],
	ignore_users text [] default '{}'::text [],
	ignore_roles text [] default '{}'::text [],
	delete_bots boolean default false,
	log_channel_id varchar(20),
	primary key (guild_id, channel_id)
);

create table if not exists server_settings (
	guild_id varchar(20) not null primary key,
	default_log_channel_id varchar(20)
);

create table if not exists dagi_count (
	id serial primary key,
	count integer default 0 not null
);

create table if not exists user_formulas (
	user_id varchar(20) not null,
	name varchar(50) not null,
	expression text not null,
	primary key (user_id, name)
);

---

select * from user_formulas;

select * from server_settings;

select * from dagi_count;
