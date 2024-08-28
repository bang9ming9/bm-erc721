# BmERC721

이 NFT는 문자열을 저장할 수 있는 기능을 가진 디지털 자산입니다. 아래는 이 NFT의 주요 특징과 사용 방법입니다:

주요 특징
문자열 저장: 이 NFT는 하나의 문자열을 저장할 수 있습니다.<br>
Minting: 일정 수량의 ERC1155 토큰을 소모하여 이 NFT를 mint 할 수 있습니다.<br>
전송 제약: NFT가 생성된 후에는 즉시 전송 가능한 상태가 아닙니다.<br>
<br>

### 전송 가능한 상태로 변경하기
NFT가 전송 가능한 상태로 변경되기 위해서는 다음과 같은 절차가 필요합니다:

Governance 투표: NFT의 전송 가능 상태를 변경하기 위해서는 **BmGovernance** 통해 승인을 받아야 합니다. <br>
> 이 시스템은 거버넌스의 결정에 따라 NFT의 전송 가능 여부를 제어하며, 거버넌스 참여자들이 해당 NFT의 가치 여부를 결정할 수 있도록 합니다.

<hr>

이 프로젝트는 Hardhat을 경험하기 위해 생성한 것이며, [bm-governance](https://github.com/bang9ming9/bm-governance)의 연장선으로 이해하시면 좋을것 같습니다. <br>
보유한 BmErc1155 중 해당 주에 사용되는 tokenID 를 제외하면 모두 가치가 없게 되어, 그러한 토큰을 사용해서 BmErc721 을 mint 합니다.


<br>
<br>
<br>

# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.ts
```
