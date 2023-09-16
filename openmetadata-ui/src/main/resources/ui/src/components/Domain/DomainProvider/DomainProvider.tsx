/*
 *  Copyright 2023 Collate.
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *  http://www.apache.org/licenses/LICENSE-2.0
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import { AxiosError } from 'axios';
import { DEFAULT_DOMAIN_VALUE, PAGE_SIZE_LARGE } from 'constants/constants';
import { Domain } from 'generated/entity/domains/domain';
import React, {
  FC,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { getDomainList } from 'rest/domainAPI';
import { showErrorToast } from 'utils/ToastUtils';
import { DomainContextType } from './DomainProvider.interface';

export const DomainContext = React.createContext({} as DomainContextType);

interface Props {
  children: ReactNode;
}

const DomainProvider: FC<Props> = ({ children }: Props) => {
  const { t } = useTranslation();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [domainLoading, setDomainLoading] = useState(false);

  const domainOptions = useMemo(() => {
    const options: ItemType[] = [
      {
        label: t('label.all-domain-plural'),
        key: DEFAULT_DOMAIN_VALUE,
      },
    ];
    domains.forEach((domain: Domain) => {
      options.push({
        label: domain.displayName ?? domain.name,
        key: domain.fullyQualifiedName ?? '',
      });
    });

    return options;
  }, [domains]);

  const fetchDomainList = async () => {
    setDomainLoading(true);
    try {
      const { data } = await getDomainList({
        limit: PAGE_SIZE_LARGE,
      });
      setDomains(data);
    } catch (error) {
      showErrorToast(error as AxiosError);
    } finally {
      setDomainLoading(false);
    }
  };

  const updateDomains = (domainsArr: Domain[]) => {
    setDomains(domainsArr);
  };

  const refreshDomains = () => {
    fetchDomainList();
  };

  useEffect(() => {
    fetchDomainList();
  }, []);

  return (
    <DomainContext.Provider
      value={{
        domains,
        domainOptions,
        domainLoading,
        updateDomains,
        refreshDomains,
      }}>
      {children}
    </DomainContext.Provider>
  );
};

export const useDomainProvider = () => useContext(DomainContext);

export default DomainProvider;
