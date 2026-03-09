// Simple Bedrock test script
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

const client = new BedrockRuntimeClient({ region: 'us-east-1' });

async function testHaiku() {
  console.log('Testing Claude Haiku...');
  
  const command = new InvokeModelCommand({
    modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
    body: JSON.stringify({
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 50,
      messages: [
        {
          role: 'user',
          content: 'Say hello in one word'
        }
      ]
    })
  });

  try {
    const response = await client.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    console.log('✓ Haiku works!');
    console.log('Response:', responseBody.content[0].text);
    return true;
  } catch (error) {
    console.log('✗ Haiku failed:',error.name, error.message);
    return false;
  }
}

async function testSonnet() {
  console.log('\nTesting Claude Sonnet...');
  
  const command = new InvokeModelCommand({
    modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
    body: JSON.stringify({
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 50,
      messages: [
        {
          role: 'user',
          content: 'Say hello in one word'
        }
      ]
    })
  });

  try {
    const response = await client.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    console.log('✓ Sonnet works!');
    console.log('Response:', responseBody.content[0].text);
    return true;
  } catch (error) {
    console.log('✗ Sonnet failed:', error.name, error.message);
    return false;
  }
}

async function main() {
  const haikuWorks = await testHaiku();
  const sonnetWorks = await testSonnet();
  
  console.log('\n========================================');
  console.log('Summary:');
  console.log('Haiku:', haikuWorks ? '✓ Working' : '✗ Not working');
  console.log('Sonnet:', sonnetWorks ? '✓ Working' : '✗ Not working');
  console.log('========================================');
  
  process.exit(haikuWorks && sonnetWorks ? 0 : 1);
}

main();
