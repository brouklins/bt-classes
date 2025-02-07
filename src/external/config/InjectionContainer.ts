import { Container } from 'inversify';
import ContractModelMapperImpl from '../../mapper/ContractModelMapperImpl';
import IContractModelMapper from '../../mapper/IContractModelMapper';
import ContractUseCaseImpl from '../../usecase/ContractUseCaseImpl';
import IContractUseCase from '../../usecase/IContractUseCase';
const container = new Container();

container.bind<IContractModelMapper>('IContractModelMapper').to(ContractModelMapperImpl);
container.bind<IContractUseCase>('IContractUseCase').to(ContractUseCaseImpl);

export { container };

