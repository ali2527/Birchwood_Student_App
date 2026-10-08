const DEFAULT_TITLES = {
  danger: 'Something went wrong',
  success: 'All set',
  warning: 'Please check',
  info: 'Notice',
};

const SKIP = [
  /restoring your session/i,
  /found account details/i,
  /found teacher details/i,
  /children found/i,
  /^child found$/i,
];

const RULES = [
  {
    test: /network request failed|network error|failed to fetch|econnrefused|timeout|timed out|err_network/i,
    type: 'danger',
    title: "Can't connect",
    description: 'Check your internet, or make sure the school server is running.',
  },
  {
    test: /please try again later|failed to send verification email/i,
    type: 'danger',
    title: "Couldn't send email",
    description: 'Please try again in a moment.',
  },
  {
    test: /invalid password|incorrect password|current password is invalid/i,
    type: 'danger',
    title: 'Wrong password',
    description: 'Try again, or tap Forgot Password if you need a reset.',
  },
  {
    test: /email not found|does not exist|nobody|unknown email|parent with this email not found/i,
    type: 'danger',
    title: 'No account found',
    description: "We couldn't find a parent account with that email.",
  },
  {
    test: /already exist/i,
    type: 'warning',
    title: 'Email already used',
    description: 'This email is registered. Sign in, or use a different email.',
  },
  {
    test: /not active/i,
    type: 'warning',
    title: 'Account pending',
    description: "Your account isn't active yet. Please wait for school approval.",
  },
  {
    test: /too weak|is too weak/i,
    type: 'warning',
    title: 'Password too weak',
    description:
      'Use at least 8 characters with uppercase, lowercase, a number, and a symbol.',
  },
  {
    test: /confirmation does not match|passwords do not match|confirm password/i,
    type: 'warning',
    title: "Passwords don't match",
    description: 'Enter the same password in both fields.',
  },
  {
    test: /cannot be same as old|must be different from your current/i,
    type: 'warning',
    title: 'Choose a new password',
    description: 'Your new password must be different from the current one.',
  },
  {
    test: /session expired|token expired|unauthorized|access forbidden|please sign in/i,
    type: 'warning',
    title: 'Please sign in again',
    description: 'Your session ended. Sign in to continue.',
  },
  {
    test: /logged in successfully|signed in successfully|parent logged in/i,
    type: 'success',
    title: 'Welcome back',
    description: "You're signed in.",
  },
  {
    test: /account created|welcome to birchwood/i,
    type: 'success',
    title: 'Account created',
    description: 'Welcome to Birchwood. You are signed in.',
  },
  {
    test: /password updated|password reset/i,
    type: 'success',
    title: 'Password updated',
    description: 'You can sign in with your new password.',
  },
  {
    test: /user updated successfully|profile updated/i,
    type: 'success',
    title: 'Profile saved',
    description: 'Your details were updated.',
  },
  {
    test: /verification code verified/i,
    type: 'success',
    title: 'Code verified',
    description: 'You can now set a new password.',
  },
  {
    test: /recovery code has been emailed|emailed to your registered/i,
    type: 'success',
    title: 'Check your email',
    description: 'We sent a 4-digit code to your registered email.',
  },
  {
    test: /invalid verification code|verification code is invalid/i,
    type: 'danger',
    title: 'Invalid code',
    description: 'That code is incorrect or expired. Request a new one.',
  },
  {
    test: /dosent match email|doesn't match that email|doesnt match email/i,
    type: 'danger',
    title: 'Code does not match',
    description: 'This reset code is not valid for that email.',
  },
  {
    test: /email is invalid|enter a valid email/i,
    type: 'warning',
    title: 'Invalid email',
    description: 'Enter a valid email address, like name@email.com.',
  },
  {
    test: /phone number is required/i,
    type: 'warning',
    title: 'Phone required',
    description: 'Enter a phone number so the school can reach you.',
  },
  {
    test: /father first name is required/i,
    type: 'warning',
    title: 'Father first name',
    description: "Enter the father's first name (at least 3 letters).",
  },
  {
    test: /father last name is required/i,
    type: 'warning',
    title: 'Father last name',
    description: "Enter the father's last name.",
  },
  {
    test: /mother first name is required/i,
    type: 'warning',
    title: 'Mother first name',
    description: "Enter the mother's first name (at least 3 letters).",
  },
  {
    test: /mother last name is required/i,
    type: 'warning',
    title: 'Mother last name',
    description: "Enter the mother's last name.",
  },
  {
    test: /email is required/i,
    type: 'warning',
    title: 'Email required',
    description: 'Enter the parent email for this account.',
  },
  {
    test: /password is required/i,
    type: 'warning',
    title: 'Password required',
    description: 'Enter a password to continue.',
  },
  {
    test: /no user found|parent not found|no parent found/i,
    type: 'danger',
    title: 'Account not found',
    description: 'We could not load this profile. Try signing in again.',
  },
  {
    test: /child not found/i,
    type: 'warning',
    title: 'Child not found',
    description: 'That child is not linked to this account.',
  },
  {
    test: /no child selected/i,
    type: 'warning',
    title: 'Select a child',
    description: 'Link or select a child to continue.',
  },
  {
    test: /image file type not allowed|file type not allowed/i,
    type: 'warning',
    title: 'Photo not allowed',
    description: 'Use a JPG, PNG, or WEBP image.',
  },
  {
    // Keep the original limit text (e.g. "Keep the document under 2 MB.") as the title.
    test: /keep (the )?(photo|document|file|voice).+under|under \d+(\.\d+)?\s*(kb|mb)|file too large|800\s*k|too big for chat|still too large|keep this file under/i,
    type: 'warning',
    title: null,
    useMessageAsTitle: true,
  },
  {
    test: /couldn'?t open that photo|couldn'?t open that document|could not read the file|could not load the file/i,
    type: 'warning',
    title: "Couldn't open the file",
    description: 'Try taking or picking it again.',
  },
];

function cleanText(value) {
  if (value == null) {
    return '';
  }
  if (typeof value === 'object') {
    if (Array.isArray(value) && value[0]?.msg) {
      return String(value[0].msg).trim();
    }
    return String(value.message || value.error || value.msg || '').trim();
  }
  return String(value).trim();
}

function isTechnical(text) {
  return (
    /validationerror|cast to|econnrefused|enotfound|mongo|mongoose|at Object\.|TypeError|ReferenceError|Cannot read/i.test(
      text,
    ) ||
    text.includes('\n    at ') ||
    text.length > 220
  );
}

function humanize(text) {
  let out = text.replace(/^Error:\s*/i, '').replace(/\s+/g, ' ').trim();
  out = out.replace(/Path `([^`]+)` is required\.?/gi, (_, field) => {
    const label = field
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, c => c.toUpperCase())
      .trim();
    return `${label} is required.`;
  });
  out = out.replace(/\bis Required\b/g, 'is required');
  out = out.replace(/\bis Invalid\b/g, 'is invalid');
  out = out.replace(/Already Exist\b/gi, 'already exists');
  out = out.replace(/\bdosent\b/gi, "doesn't");
  out = out.replace(/\bdoesnt\b/gi, "doesn't");
  if (isTechnical(out)) {
    return '';
  }
  return out;
}

export function formatAlert(raw, fallbackType = 'info') {
  const text = humanize(cleanText(raw));

  if (SKIP.some(rule => rule.test(text))) {
    return {skip: true};
  }

  const rule = RULES.find(item => item.test.test(text));
  if (rule) {
    if (rule.useMessageAsTitle) {
      return {
        skip: false,
        type: rule.type,
        title: text.replace(/\.$/, ''),
        description: undefined,
      };
    }
    return {
      skip: false,
      type: rule.type,
      title: rule.title,
      description: rule.description,
    };
  }

  const type = fallbackType;
  const title = DEFAULT_TITLES[type] || DEFAULT_TITLES.info;

  if (!text) {
    return {
      skip: false,
      type,
      title,
      description: type === 'danger' ? 'Please try again.' : 'Done.',
    };
  }

  if (text.length <= 42) {
    return {
      skip: false,
      type,
      title: text.replace(/\.$/, ''),
      description: undefined,
    };
  }

  return {
    skip: false,
    type,
    title,
    description: text,
  };
}
