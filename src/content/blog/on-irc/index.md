---
title: "On IRC"
date: 2026-05-05
description: "Discussing the history of IRC and its use in 2026"
tags: ["IRC", "Golang"]
atUri: "at://did:plc:tgb4klpomminc5lv3clzb6wm/site.standard.document/3mn5m2mgqn2ie"
---

# On IRC

Being a member of the elusive *Gen Z* club, IRC is not a technology that I got exposure to until about 2 weeks ago, when
a routine YouTube rabbit hole revealed this magnificent relic of days past. *Or is it?*

## What are you on about now?

Internet Relay Chat, more commonly known as IRC, is a text-based chat service designed for channel-based communication
(think Discord). It also allows private messaging and file sharing! It operates on the Application level of the TCP/IP
suite, and as of April 2026, served more than 162,000 <sup>[<cite>[1]</cite>]</sup> users concurrently.

## A brief history

IRC was created by Jarkko "WiZ" Oikarinen in August 1998 to replace an old, outdated program known as MultiUser Talk at the
University of Oulu's Bulletin Board System. The service very quickly spread to neighbouring Finnish universities, and
eventually, worldwide. Subsequent disagreements over network security and connections lead to portions of the network
being "Q-lined" <sup>[<cite>[1]</cite>]</sup> (quarantined) from each other. Many forks and networks have been set up,
until today's de facto network, [Libera Chat](https://libera.chat/) was established in 2021.

## Technical details

Like previously mentioned, IRC sits within the TCP/IP suite. More recent versions facilitate the use of TLS for encrypted
transmissions. An IRC server connects to other IRC servers, forming the IRC network that is still in operation today.
Typically, TCP connections are done over port 6667, and TLS connections over 6697. An IRC network can be represented as
as a tree, with messages only travelling over edges that are needed to facilitate the delivery. IRC can even be hosted
on a LAN due to the IRC daemon's functionality.

## What I did

Today, I released the first version of [glirc](https://github.com/liampallett/glirc), an IRC client written in Golang.
It is not something that will land me a job, nor is in a language that I will work with again, but the fact that I can
still interface with IRC in 2026 is something that really interests me. So many times it could have been shut down or
replaced ([Microsoft tried](https://en.wikipedia.org/wiki/Microsoft_Notification_Protocol)), and yet, it survives! It
really is a testament to the perseverance of the old internet.

Please go check the project out!

#### *Bibliography*

[1]: https://en.wikipedia.org/wiki/IRC