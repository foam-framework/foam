---
layout: page
title: Context Guide
permalink: /guides/context/
---

## What is a Context?

A context looks very much like a map, and behaves like a map, except it has inhertitance.

Methods on context - 

1. ```x.get(‘key’)```
	If there is a value associated with that key, it is returned, else null.
2. ```x.put(key,value)```
	This returns a new context x’, with all the values of the old context plus the new key pair
	context is immutable, putting will always return a new (sub)context.
	This is important, because we do lots of gets, and so we don’t have to lock it because it’s immutable.
3. ```x.putFactory(key, factory)```
	When you call a get on this key, it will return the return value of the factory.
	One additional feature here is, the factory gets the context you call it from, and runs with that context - so it can be aware of who is calling it.



## Session Context, Request Context

When someone connects to the system, we create a new session, which has a context which is a subcontext of the system context, with the addition of a key value pair of with the key as 'session' and the value point back to the newly create session.

Then you connect to the webAgent, which then creates per request a subcontext of your session context by putting the HTTP Request, Response, printwriter in the context. Then your code runs in the request context.

So there is hierarchy here - 

System context - only 1 - persists - created at system startup
	System context is created from boot.java
	It has factories for most services, and the first time you access it creates the services, unless the service	is marked as not lazy.

Session context - 1 per session per user, inherits from system context - created when user connects to system
	If you want to cache some information per user per session, you can put it in the session context, and then every subsequent request context will have access to that. 


Request context - 1 per request, inherits from session context - created by a WebAgent on each new request


Context is helpful because it hides the source of dependancies (data). You write code against a single interface, and run it anywhere, and the data will just be in the context, no matter where the code is being called from.


