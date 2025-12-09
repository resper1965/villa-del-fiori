import Link from "next/link"
import { Building2 } from "lucide-react"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-[#00ade8] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg shadow-lg p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2 mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 rounded-full bg-[#00ade8]">
                <Building2 className="h-8 w-8 text-white stroke-1" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-200">Política de Privacidade</h1>
            <p className="text-gray-400">Gabi - Síndica Virtual</p>
          </div>

          {/* Conteúdo */}
          <div className="prose prose-invert max-w-none space-y-6 text-gray-300">
            <section>
              <h2 className="text-xl font-semibold text-gray-200 mb-3">1. Introdução</h2>
              <p className="text-gray-300 leading-relaxed">
                Esta Política de Privacidade descreve como o Condomínio Villa Dei Fiori coleta, usa e protege 
                suas informações pessoais quando você usa o sistema Gabi - Síndica Virtual.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-200 mb-3">2. Informações Coletadas</h2>
              <p className="text-gray-300 leading-relaxed mb-3">
                Coletamos as seguintes informações quando você se cadastra e usa o sistema:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-gray-300">
                <li>Nome completo</li>
                <li>Endereço de e-mail</li>
                <li>Tipo de usuário (síndico, morador, conselheiro, etc.)</li>
                <li>Informações de uso do sistema</li>
                <li>Dados de autenticação e sessão</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-200 mb-3">3. Como Usamos Suas Informações</h2>
              <p className="text-gray-300 leading-relaxed mb-3">
                Utilizamos suas informações para:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-gray-300">
                <li>Fornecer e manter o sistema</li>
                <li>Autenticar e autorizar seu acesso</li>
                <li>Gerenciar processos e aprovações condominiais</li>
                <li>Comunicar informações relevantes sobre o condomínio</li>
                <li>Melhorar a segurança e funcionalidade do sistema</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-200 mb-3">4. Compartilhamento de Informações</h2>
              <p className="text-gray-300 leading-relaxed">
                Não compartilhamos suas informações pessoais com terceiros, exceto quando necessário para:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-gray-300 mt-3">
                <li>Cumprir obrigações legais</li>
                <li>Proteger os direitos e segurança do condomínio</li>
                <li>Fornecer serviços essenciais do sistema (provedores de infraestrutura)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-200 mb-3">5. Segurança dos Dados</h2>
              <p className="text-gray-300 leading-relaxed">
                Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações pessoais 
                contra acesso não autorizado, alteração, divulgação ou destruição. Isso inclui criptografia, 
                controles de acesso e monitoramento regular.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-200 mb-3">6. Retenção de Dados</h2>
              <p className="text-gray-300 leading-relaxed">
                Mantemos suas informações pessoais apenas pelo tempo necessário para cumprir os propósitos descritos 
                nesta política, a menos que um período de retenção mais longo seja exigido ou permitido por lei.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-200 mb-3">7. Seus Direitos</h2>
              <p className="text-gray-300 leading-relaxed mb-3">
                Você tem o direito de:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-gray-300">
                <li>Acessar suas informações pessoais</li>
                <li>Corrigir informações incorretas ou incompletas</li>
                <li>Solicitar a exclusão de suas informações (sujeito a obrigações legais)</li>
                <li>Retirar seu consentimento para processamento de dados</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-200 mb-3">8. Cookies e Tecnologias Similares</h2>
              <p className="text-gray-300 leading-relaxed">
                O sistema utiliza cookies e tecnologias similares para manter sua sessão ativa e melhorar sua experiência. 
                Você pode configurar seu navegador para recusar cookies, mas isso pode afetar a funcionalidade do sistema.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-200 mb-3">9. Alterações nesta Política</h2>
              <p className="text-gray-300 leading-relaxed">
                Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre mudanças 
                significativas publicando a nova política nesta página e atualizando a data de "Última atualização".
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-200 mb-3">10. Contato</h2>
              <p className="text-gray-300 leading-relaxed">
                Se você tiver dúvidas sobre esta Política de Privacidade ou sobre como tratamos suas informações pessoais, 
                entre em contato com a administração do condomínio.
              </p>
            </section>

            <div className="pt-6 border-t border-gray-700">
              <p className="text-sm text-gray-400">
                Última atualização: {new Date().toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-6 text-center">
            <Link 
              href="/login" 
              className="text-[#00ade8] hover:underline text-sm"
            >
              Voltar para o login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
