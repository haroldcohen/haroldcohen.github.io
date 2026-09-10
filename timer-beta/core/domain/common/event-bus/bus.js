// This is not real DDD, just a naming convention: a Command decides *if*
// something should happen and fires a DomainEvent describing what did;
// separate consumer functions subscribed to that event are the only code
// that mutates storage or the DOM. Keeps "is this allowed" logic apart
// from "what changes as a result".
function dispatchDomainEvent(name, detail) {
    domainEvents.dispatchEvent(new CustomEvent(name, { detail }));
}

function onDomainEvent(name, handler) {
    domainEvents.addEventListener(name, (event) => handler(event.detail));
}
