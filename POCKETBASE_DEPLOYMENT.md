# PocketBase deployment

The Next.js client connects to the URL in `NEXT_PUBLIC_POCKETBASE_URL`.
Copy `.env.example` to `.env.local` for local development, and set the same
variable in the hosting provider for production. Do not expose a superuser
email or password in the Next.js app.

The Docker image copies `pb/pb_migrations` to `/pb/pb_migrations`. Mount a
Render persistent disk only at `/pb/pb_data`, not at `/pb`, so the disk does
not hide the migrations included in the image. PocketBase runs pending
migrations when the container starts.

## Collections

Create an auth collection named `users` and a collection named `Tasks` with
these fields:

| Field | Type | Required |
| --- | --- | --- |
| `firstName` | text | yes |
| `lastName` | text | yes |
| `taskContent` | text | yes |
| `email` | email or text | no |
| `phone` | text | no |
| `status` | select | yes |
| `workerId` | relation to `users`, single | yes |

Configure the `status` select options as:

```text
pending
completed
cancelled
```

## API rules

These rules match the dashboard, which shows and updates only the logged-in
user's tasks:

| Rule | Value |
| --- | --- |
| List/View | `@request.auth.id = workerId` |
| Update | `@request.auth.id = workerId` |
| Delete | locked |

The public form currently creates tasks for a worker ID entered by the user.
If that form is intentionally public, leave the `Create` rule empty. If only
authenticated users should submit tasks, use:

```text
@request.auth.id != ""
```

For an administrator that must manage every task, use a separate admin role
field and add that role to the rules, for example:

```text
@request.auth.id = workerId || @request.auth.role = "admin"
```

Do not use superuser credentials in browser code. Superuser credentials belong
only on a trusted server.