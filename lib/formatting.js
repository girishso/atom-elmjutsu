'use babel';

import * as React from 'react';

export default {
  formatMessage(messages, messagesEnhanced) {
    const leadingSpaces = findLeadingSpacesLength(messages)
    console.log("messages", messages, leadingSpaces)

    const partViews = messages.map(partView => {
      return formatPart(partView, messagesEnhanced, leadingSpaces);
    });

    return (
      <div>
        <div className="elmjutsu-problem">{partViews}</div>
      </div>
    );
  },
};

function findLeadingSpacesLength(messages) {
  if (typeof messages[2] === 'string') {
    const matched = messages[2].match(/(^ +?)\S/)
    return (matched && typeof matched[1] !== 'undefined' ? matched[1].length : 0)
  } else {
    return 0
  }
}

function formatPart(part, messagesEnhanced, leadingSpaces) {
  if (typeof part === 'string') {
    const part_ = part.match(/^ {2,}/) ? part.substr(leadingSpaces, part.length) : part

    const txt = formatText(part_, messagesEnhanced)

    return <span>{txt}</span>;
  } else {
    return (
      <span className={'elmjutsu-color-' + part.color}>
        {formatChunk(part, messagesEnhanced)}
      </span>
    );
  }
}

function formatChunk(chunk, messagesEnhanced) {
  const children = formatText(chunk.string, messagesEnhanced, true);
  if (chunk.bold && chunk.underline) {
    return (
      <b>
        <u>{children}</u>
      </b>
    );
  } else if (chunk.bold) {
    return <b>{children}</b>;
  } else if (chunk.underline) {
    return <u>{children}</u>;
  } else {
    return children;
  }
}

function formatText(text, messagesEnhanced, isChunk = false) {
  if (text.length === 0) {
    return '';
  }
  // Check if text has URLs.
  if (messagesEnhanced && /<\n?h\n?t\n?t\n?p/.test(text)) {
    return formatTextWithUrl(text);
  }
  return formatTextParts(text, isChunk);
}

function formatTextParts(text, isChunk) {
  // console.log("isChunk, text: ", isChunk, text)

  if (text.match(/\n/)) {
    // add <br/> to multiline parts except the last one
    const parts = text.split(/\n/g);
    const lastIndex = parts.length - 1;

    return parts.map((part, index) => {
      // console.log("part, index: ", index, part )
      const br = lastIndex > 0 && lastIndex == index ? null : <br/>;
      return (<span>{part.replace(/ /g, '\u00a0')}{br}</span>)
    })

  } else {
    // add <br/> to single line if it's not a chunk and not a Hint
    const br =
      text[0] == ':' ? null
        : isChunk ? null
        : <br />;
    return (<span>{text.replace(/ /g, '\u00a0')}{br}</span>)

  }
  // const br = !text.match(/\n/) && !isChunk ? <br/>
  //               : null

  // return <span>{text.replace(/ /g, '\u00a0')}{br}</span>

  // return parts.map((part, index) => {
  //   const maybeLineBreak =  (index < lastIndex || part !== '>') ? <br /> : '';
  //   return (
  //     <span>
  //       {part.replace(/ /g, '\u00a0')}
  //       {maybeLineBreak}
  //     </span>
  //   );
  // });
}

function formatTextWithUrl(text) {
  // From https://stackoverflow.com/questions/3809401/what-is-a-good-regular-expression-to-match-a-url:
  const urlRegex = /<(https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b(?:[-a-zA-Z0-9@:%_\+.~#()?&//=]*))>/g;
  const parts = text.split(urlRegex);
  if (parts.length >= 3) {
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return formatUrl(part);
      }
      return formatTextParts(part);
    });
  }
  return formatTextParts(text);
}

function formatUrl(text) {
  return <a href={text}>{formatTextParts(text)}</a>;
}
