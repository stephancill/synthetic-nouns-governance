import { Button, Col, Row, Spinner } from 'react-bootstrap';
import Section from '../../layout/Section';
import {
  Proposal,
  snapshotProposalToProposal,
  useAllProposals,
  useProposalThreshold,
} from '../../wrappers/nounsDao';
import { useAllBigNounProposals } from '../../wrappers/bigNounsDao';
import Proposals, { SnapshotProposal } from '../../components/Proposals';
import classes from './Governance.module.css';
import { utils } from 'ethers/lib/ethers';
import clsx from 'clsx';
import { useTreasuryBalance, useTreasuryUSDValue } from '../../hooks/useTreasuryBalance';

import NounImageInllineTable from '../../components/NounImageInllineTable';
import { isMobileScreen } from '../../utils/isMobile';
import { useEffect, useState } from 'react';

import { snapshotProposalsQuery, nounsInTreasuryQuery } from '../../wrappers/subgraph';
import { useQuery } from '@apollo/client';
import Link from '../../components/Link';
import { RouteComponentProps } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

const GovernancePage = ({
  match: {
    params: { id },
  },
}: RouteComponentProps<{ id: string }>) => {
  const { data: bigNounProposals, loading: loadingBigNounProposals } = useAllBigNounProposals();

  const {
    loading: nounsInTreasuryLoading,
    error: nounsInTreasuryError,
    data: nounsInTreasury,
  } = useQuery(nounsInTreasuryQuery(), {
    context: { clientName: 'NounsDAO' },
  });

  const {
    loading: snapshotProposalLoading,
    error: snapshotProposalError,
    data: snapshotProposalData,
  } = useQuery(snapshotProposalsQuery(), {
    context: { clientName: 'NounsDAOSnapshot' },
  });

  const threshold = useProposalThreshold();
  const nounsRequired = threshold !== undefined ? threshold + 1 : '...';
  const nounThresholdCopy = `${nounsRequired} ${
    threshold === 0 ? 'Synthetic Noun' : 'Synthetic Nouns'
  }`;

  const [isNounsDAOProp, setisNounsDAOProp] = useState(false);
  const [snapshotProposals, setSnapshotProposals] = useState<SnapshotProposal[] | null>(null);

  const proposals = snapshotProposals
    ? snapshotProposals.map(sp => snapshotProposalToProposal(sp)!)
    : undefined;

  const treasuryBalance = useTreasuryBalance();
  const treasuryBalanceUSD = useTreasuryUSDValue();

  const [daoButtonActive, setDaoButtonActive] = useState('1');

  const isMobile = isMobileScreen();

  function setLilNounsDAOProps() {
    setDaoButtonActive('1');
    setisNounsDAOProp(false);
    window.history.pushState({}, 'Lil Nouns DAO', '/vote');
  }

  function setNounsDAOProps() {
    setDaoButtonActive('2');
    setisNounsDAOProp(true);
    window.history.pushState({}, 'Lil Nouns DAO', '/vote/nounsdao');
  }

  const location = useLocation();

  useEffect(() => {
    if (!location.pathname) return;

    if (location.pathname == '/vote/nounsdao') {
      setNounsDAOProps();
    }
  }, []);

  useEffect(() => {
    if (snapshotProposalData) {
      setSnapshotProposals(
        snapshotProposalData.proposals.map((v: any, i: any) => ({
          ...v,
          proposalNo: i + 1,
        })),
      );
    } else {
      setSnapshotProposals(null);
    }
  }, [snapshotProposalData]);

  const nounsDaoLink = <Link text="Nouns DAO" url="https://nouns.wtf" leavesPage={true} />;
  const snapshotLink = (
    <Link text="Snapshot" url="https://snapshot.org/#/mrtn.eth" leavesPage={true} />
  );

  if (nounsInTreasuryLoading || snapshotProposalLoading || loadingBigNounProposals) {
    return (
      <div className={classes.spinner}>
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <Section fullWidth={false} className={classes.section}>
      <Col lg={10} className={classes.wrapper}>
        <Row className={classes.headerRow}>
          <span>Governance</span>
          <div className={classes.headerWrapper}>
            <h1>{!isNounsDAOProp ? 'Plebeian Assembly' : 'Nouns DAO'}</h1>
            <div className="btn-toolbar" role="btn-toolbar" aria-label="Basic example">
              <Button
                key={1}
                className={
                  daoButtonActive === '1'
                    ? classes.governanceSwitchBtnActive
                    : classes.governanceSwitchBtn
                }
                id={'1'}
                onClick={e => setLilNounsDAOProps()}
              >
                Pleb DAO
              </Button>
              <Button
                key={2}
                className={
                  daoButtonActive === '2'
                    ? classes.governanceSwitchBtn2Active
                    : classes.governanceSwitchBtn2
                }
                onClick={e => setNounsDAOProps()}
              >
                Nouns DAO
              </Button>
            </div>
          </div>
        </Row>

        <>
          <p className={classes.subheading}>
            {!isNounsDAOProp ? (
              <>
                Synthetic Nouns govern the{' '}
                <span className={classes.boldText}>Plebeian Assembly</span>. A minimum of{' '}
                <span className={classes.boldText}>{'1 Synthetic Noun'}</span> is required to vote.
              </>
            ) : (
              <>
                Synthetic Nouns use Nouns collectively allocated to the DAO to govern in{' '}
                <span className={classes.boldText}>{nounsDaoLink}</span>. Plebeians can use their
                synthetic nouns to vote on Nouns DAO proposals. Voting is free and is conducted via{' '}
                <span className={classes.boldText}>{snapshotLink}</span>. A minimum of{' '}
                <span className={classes.boldText}>{'1 Synthetic Noun'}</span> is required to vote.
              </>
            )}
          </p>

          <Row className={classes.treasuryInfoCard}>
            <Col lg={8} className={classes.treasuryAmtWrapper}>
              <Row className={classes.headerRow}>
                <span>Treasury</span>
              </Row>

              {isNounsDAOProp ? (
                <></>
              ) : (
                <Row>
                  <Col className={clsx(classes.ethTreasuryAmt)} lg={3}>
                    <h1 className={classes.ethSymbol}>Ξ</h1>
                    <h1>
                      {treasuryBalance &&
                        Number(
                          Number(utils.formatEther(treasuryBalance)).toFixed(0),
                        ).toLocaleString('en-US')}
                    </h1>
                  </Col>
                  <Col className={classes.usdTreasuryAmt}>
                    <h1 className={classes.usdBalance}>
                      ${' '}
                      {treasuryBalanceUSD &&
                        Number(treasuryBalanceUSD.toFixed(0)).toLocaleString('en-US')}
                    </h1>
                  </Col>
                </Row>
              )}

              <Row>
                <Col className={clsx(classes.ethTreasuryAmt)} lg={3}>
                  <h1 className={classes.BigNounBalance}>
                    {nounsInTreasury.accounts[0].tokenBalance}
                  </h1>
                  <h1>{' Nouns'}</h1>
                </Col>

                {!isMobile && (
                  <Col className={classes.usdTreasuryAmt}>
                    <Row className={classes.nounProfilePics}>
                      <NounImageInllineTable
                        nounIds={nounsInTreasury.accounts[0].nouns.flatMap(
                          (obj: { id: any }) => obj.id,
                        )}
                      />
                    </Row>
                  </Col>
                )}
              </Row>
            </Col>
            <Col className={classes.treasuryInfoText}>
              {!isNounsDAOProp ? (
                <>
                  This treasury exists for the{' '}
                  <span className={classes.boldText}>Plebeian Assembly DAO</span> participants to
                  allocate resources for the long-term growth and prosperity of the Plebeian
                  Assembly project.
                </>
              ) : (
                <>
                  The Nouns allocated to the Plebeian Assembly exists for{' '}
                  <span className={classes.boldText}>Plebeian Assembly DAO</span> participants to
                  allocate resources for the long-term growth and prosperity of the Nouns project.
                </>
              )}
            </Col>
          </Row>
        </>

        <Proposals
          proposals={proposals || []}
          nounsDAOProposals={bigNounProposals}
          snapshotProposals={snapshotProposals}
          isNounsDAOProp={isNounsDAOProp}
        />
      </Col>
    </Section>
  );
};
export default GovernancePage;
