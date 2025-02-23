console.log("Email Write Extension - Content Script Loaded");

function findComposeToolBar() {
    const selectors = [
        '.btc',
        '.aDh',
        'role="toolbar',
        '.gU.Up'
    ];
    
    for (const selector of selectors) {
        const toolbar = document.querySelector(selector);
        if (toolbar) {
            return toolbar;
        }
    }
    return null;
}

function getEmailContent() {
    const selectors = [
        '.h7',
        '.a3s.aiL',
        'role="presentation',
        '.gmail_quote'
    ];
    
    for (const selector of selectors) {
        const content = document.querySelector(selector);
        if (content) {
            return content.innerText.trim();
        }
        return '';
    }
}

function createAIButton() {
    const button = document.createElement('div');
    button.className = 'T-I J-J5-Ji aoO v7 T-I-atl L3';
    button.style.marginRight = '8px';
    button.style.padding = '6px 12px';
    button.style.fontSize = '13px';
    button.style.fontWeight = '500';
    button.style.color = '#fff';
    button.style.border = '1px solid transparent';
    button.style.borderRadius = '4px';
    button.style.cursor = 'pointer';
    button.style.display = 'inline-block';
    button.style.verticalAlign = 'middle';
    button.innerHTML = 'AI Reply';
    button.setAttribute('role', 'button');
    button.setAttribute('data-tooltip', 'Generate AI Reply');
    return button;
}

function injectButton() {
    const existingButton = document.querySelector('ai-reply-button');
    if (existingButton) {
        existingButton.remove;
    }
    const toolbar = findComposeToolBar();
    if (!toolbar) {
        console.log("ToolBar not Found");
        return;
    }
    console.log("ToolBar Found, creating AI Button");
    const button = createAIButton();
    button.classList.add('ai-reply-button');

    button.addEventListener('click', async () => {
        try {
            button.innerHTML = 'Generating...';
            button.disabled = true;

            const emailContent = getEmailContent();
            const response = await fetch('http://localhost:8080/api/email/generate', {
                method: "POST",
                headers: {
                    'Content-type' : 'application/json',
                },
                body: JSON.stringify({
                    emailContent: emailContent,
                    tone: "professional"
                })
            });
            if (!response.ok) {
                throw new Error('API Reqeust Failed');
            }
            const generatedReply = await response.text();
            const composeBox = document.querySelector('[role="textbox"][g_editable="true"]');

            if (composeBox) {
                composeBox.focus();
                document.execCommand('insertText', false, generatedReply);
            } else {
                console.log("Compose Box was not found")
            }

        } catch (error) {
            console.log(error)
            alert("Failed to Generate reply");

        } finally {
            button.innerHTML = 'AI Reply';
            button.disabled = false;
        }
    });

    const sendButton = toolbar.querySelector('.T-I.J-J5-Ji.aoO.T-I-atl.L3');

    // toolbar.insertBefore(button, toolbar.firstChild);
    sendButton.parentNode.insertBefore(button, sendButton);
}

const observer = new MutationObserver((mutations) => {
    for(const mutation of mutations) {
        const addedNodes = Array.from(mutation.addedNodes);
        const hasComposeElements = addedNodes.some( node => 
            node.nodeType === node.ELEMENT_NODE &&
            (node.matches('.aDh, .btc, [role="dialog"]') || node.querySelector('.aDh, .btc, [role="dialog"]'))
        );

        if (hasComposeElements) {
            console.log("Compose Window Detected");
            setTimeout(injectButton, 500);
        }
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
})