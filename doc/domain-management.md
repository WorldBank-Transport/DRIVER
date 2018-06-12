# Domain Management

This document describes how one can manage a domain name with more specific information on how to use [Amazon Route 53](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/Welcome.html).

Instructions are provided for using Route 53, but DRIVER DNS can be configured using many different DNS providers. The necessary steps will be similar to what is required for Route 53.

## DNS

Domain registration involves a _registrant_, the person or organization registering the domain name. The _registrant_ must work with a _registrar_, an organization accredited by [ICANN](https://www.icann.org/) to sell domain names. After the domain is purchased, the _registry_ then stores the information in their database and in a public [WHOIS](https://whois.icann.org/en/dns-and-whois-how-it-works) database.

This association of easy-to-remember domains to hard-to-remember IP addresses is the primary function of the global DNS (Domain Name System).

## Amazon Route 53

Amazon Route 53 is a DNS that provides registration and routing as well as health checks. 

### Domain Registration

When registering your domain through Route 53 the registrar will be either Amazon Registrar, Inc. or their registrar associate, Gandi. You can still use other Route 53 services if using another registrar.

It is important to note that many ccTLDs (country code top-level domains) can't be registered via Route53 -- there are only 14 available in Asia, many of which are [restricted to only second-level domains](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/registrar-tld-list.html#registrar-tld-list-asiaoceania).

If you would like to use a ccTLD for your home country, you may need to register your domain with a domain registrar there.

For specific steps on how to register a domain, see [Registering a New Domain](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/domain-register.html).

### Routing

Route 53 can be used to route traffic to your AWS resources for a Route 53 domain or for a domain registered with another registrar.

Routing is configured via a [public hosted zone](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/AboutHZWorkingWith.html) which defines how traffic should be routed for that domain.

Within the hosted zone, you can configure records for your domain as you would with any DNS provider, but can also create special Route 53 records called alias records to route traffic to other AWS resources.

Note that for DRIVER, it is necessary to create an A record or AAAA record pointing to the IPv4 or IPv6 address of the app server (this is the case regardless of whether the domain is registered through Route 53 or another registrar). The address of the app server needs to be specified during deployment (see [System Administration](system-administration.md)).

For more information on routing, see [How Internet Traffic Is Routed to Your Website or Web Application](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/welcome-dns-service.html)

### Health Checks

Health checks can send notifications when a resource becomes unavailable and allow for the re-routing of traffic.

For more information on health checks, see [How Amazon Route 53 Checks the Health of Your Resources](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/welcome-health-checks.html).
