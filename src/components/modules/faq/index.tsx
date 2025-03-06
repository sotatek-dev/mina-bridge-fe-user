import { Link } from '@chakra-ui/next-js';
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Box,
  Flex,
  ListItem,
  Text,
  UnorderedList,
} from '@chakra-ui/react';

import AddIcon from '@public/assets/icons/icon.add.circle.purple.svg';

const FAQ_DATA = [
  {
    title: 'What is the Mina Bridge?',
    content:
      'It is a centralised token bridge between Mina and other blockchains, initially supporting Ethereum to Mina. There is continued development work ongoing on the bridge with new features and improvements regularly being added.',
  },
  {
    title: 'Who operates the bridge?',
    content: (
      <>
        <Link
          color={'blue.500'}
          href={'https://www.sotatek.com/'}
          variant={'_blank'}
          isExternal
        >
          Sotatek
        </Link>{' '}
        has developed the bridge and will operate it in production.
      </>
    ),
  },
  {
    title: 'How is the bridge secured?',
    content: (
      <UnorderedList>
        <ListItem>Multi-Signature (MultiSig) Validators</ListItem>
        <ListItem>
          Third-party security audits and bounty programs to detect
          vulnerabilities
        </ListItem>
        <ListItem>Daily Limits & Circuit Breakers</ListItem>
        <ListItem>Facilisis in pretium nisl aliquet</ListItem>
      </UnorderedList>
    ),
  },
  {
    title: 'Is the bridge audited?',
    content: (
      <>
        Yes. You can find the audit reports from Zellic
        <Link
          color={'blue.500'}
          href={
            'https://github.com/Zellic/publications/blob/master/Mina%20Token%20Bridge%20EVM%20-%20Zellic%20Audit%20Report.pdf'
          }
          variant={'_blank'}
          isExternal
        >
          {' '}
          here
        </Link>
        {' & '}
        <Link
          color={'blue.500'}
          href={
            'https://github.com/Zellic/publications/blob/master/Mina%20Token%20Bridge%20-%20Zellic%20Audit%20Report.pdf'
          }
          variant={'_blank'}
          isExternal
        >
          here
        </Link>
      </>
    ),
  },
  {
    title: 'What chains and assets does Mina Bridge support?',
    content: (
      <>
        Currently the bridge supports bridging ETH from Ethereum to wETH on Mina
        and bridging wETH from Mina back to ETH on Ethereum.
        <Box mt={2} />
        Work is underway to support ERC-20 tokens, for example stablecoins.
      </>
    ),
  },
  {
    title: 'Can I bridge MINA to other blockchains?',
    content: 'No. At this time you cannot bridge MINA to other blockchains.',
  },
  {
    title: 'How long does it take to bridge assets?',
    content: (
      <>
        The bridging operation takes ~120 minutes. Since the bridge can handle
        10 transactions per hour, if you submit a bridge request and there are 5
        transactions in the queue ahead of you, then you would expect to receive
        confirmation of your bridge transaction in ~150 minutes.
        <Box mt={2} />
        Before initiating a bridge transaction you can view the current expected
        wait time. After initiating a transaction you can view where your
        transaction is in the process (e.g. in the queue, locking on Ethereum,
        minting on Mina).
      </>
    ),
  },
  {
    title: 'Are there any bridging limits?',
    content: (
      <>
        Yes. To ensure asset security and prevent risks, the bridge has a daily
        transfer limit per account of 1 ETH from Ethereum to Mina and 1 wETH
        from Mina to Ethereum. The daily limit resets at 00:00 UTC every day.
        <Box mt={2} />
        If you reach the limit, please wait until the next day to continue
        transactions. If you need assistance, feel free to contact our support
        team on{' '}
        <Link
          color={'blue.500'}
          href={'https://discord.gg/cyNRSkZd'}
          variant={'_blank'}
          isExternal
        >
          Discord
        </Link>
      </>
    ),
  },
  {
    title: 'Are there any fees associated with asset bridging?',
    content: (
      <>
        Yes. You can see a breakdown of all fees{' '}
        <Link
          color={'blue.500'}
          href={'/user-guide#bridging-fee'}
          variant={'_blank'}
          isExternal
        >
          here
        </Link>
        .
      </>
    ),
  },
  {
    title: 'How can I contact support?',
    content: (
      <>
        Please submit all support requests on our Discord channel{' '}
        <Link
          color={'blue.500'}
          href={'https://discord.gg/cyNRSkZd'}
          variant={'_blank'}
          isExternal
        >
          https://discord.gg/cyNRSkZd
        </Link>
        .
      </>
    ),
  },
];

const Faq = () => {
  return (
    <Box w={'full'} mt={'80px'}>
      <Flex
        bg={'background.0'}
        borderRadius={20}
        p={10}
        flexDirection={{ base: 'column', lg: 'row' }}
      >
        <Box flex={1}>
          <Text
            fontSize={'48px'}
            fontWeight={'600'}
            color={'text.700'}
            textAlign={{ base: 'center', lg: 'left' }}
          >
            FAQ
          </Text>
        </Box>
        <Accordion flex={1} allowMultiple>
          {FAQ_DATA.map((item, index) => (
            <AccordionItem
              key={index}
              _first={{ borderWidth: 0 }}
              _last={{ borderBottomWidth: 0 }}
            >
              <AccordionButton _hover={{ background: 'none' }}>
                <Text
                  fontSize={'20px'}
                  fontFamily={'500'}
                  color={'text.700'}
                  flex={'1'}
                  textAlign={'left'}
                >
                  {item.title}
                </Text>
                <AddIcon />
              </AccordionButton>

              <AccordionPanel pb={4}>
                <Box fontSize={'16px'} color={'text.500'}>
                  {item.content}
                </Box>
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </Flex>
    </Box>
  );
};

export default Faq;
