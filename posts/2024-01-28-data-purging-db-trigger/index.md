---
title: "Data purging: A good use-case for database triggers"
date: 2024-01-28
display_date: January 28, 2024
section: Field Notes
field: Software
---


All organizations have data retention policies which define how long specific types of data should be retained, when it should be deleted, and under what circumstances it can be archived or purged. If yours doesn't, it should.

In my team, it was being implemented via background jobs. This GDPR job would filter out data based on certain status fields and delete them.

There are however certain cases where it doesn't make sense to introduce a 'status' just for data retention. For example, we had a database table created just to store some parameters related to another object. Once that object is deleted by the job based on its status, there was no point keeping the parameters. In such cases, database triggers could come in as a sweet alternative.

Database triggers are a little piece of procedural codes that are automatically executed in response to events occurring within a database. The event can be data manipulation event like insert, delete or update, or it could be a system event like login/logout. The trigger code can perform a variety of actions, such as updating other tables, enforcing business rules, or logging information.

Triggers can be created via some database management tool or via SQL commands.

For example, in this specific scenario -

```sql
CREATE TRIGGER delete_parameter
AFTER DELETE ON plans
FOR EACH ROW
BEGIN
DELETE customers
WHERE customer_id = plans.customer_id;
END;
```

Thats it, the entries in the dependent table get deleted as soon as the entries in the main table are deleted.