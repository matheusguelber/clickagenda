-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 15/11/2025 às 01:14
-- Versão do servidor: 10.4.32-MariaDB
-- Versão do PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `agendamento_barbeiro`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `agendamentos`
--

CREATE TABLE `agendamentos` (
  `id` int(11) NOT NULL,
  `cliente_id` int(11) DEFAULT NULL,
  `barbeiro_id` int(11) NOT NULL,
  `servico_id` int(11) NOT NULL,
  `cliente_nome` varchar(255) NOT NULL,
  `cliente_telefone` varchar(20) NOT NULL,
  `data` date NOT NULL,
  `hora` time NOT NULL,
  `observacoes` text DEFAULT NULL,
  `status` enum('pendente','confirmado','cancelado') DEFAULT 'pendente',
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `agendamentos`
--

INSERT INTO `agendamentos` (`id`, `cliente_id`, `barbeiro_id`, `servico_id`, `cliente_nome`, `cliente_telefone`, `data`, `hora`, `observacoes`, `status`, `criado_em`) VALUES
(1, NULL, 1, 1, 'matheus', '19994521928', '2026-01-01', '14:30:00', 'por favor irei querer uma garrafa de aguaaaaa', 'cancelado', '2025-11-12 20:58:52'),
(2, NULL, 1, 1, 'geovana souza', '119934928', '2025-12-09', '09:00:00', '', 'confirmado', '2025-11-14 00:45:36'),
(3, NULL, 1, 1, 'matheus', '19994521928', '2026-01-01', '09:00:00', '', 'confirmado', '2025-11-14 01:22:46');

-- --------------------------------------------------------

--
-- Estrutura para tabela `servicos`
--

CREATE TABLE `servicos` (
  `id` int(11) NOT NULL,
  `barbeiro_id` int(11) NOT NULL,
  `nome_servico` varchar(255) NOT NULL,
  `preco` decimal(10,2) NOT NULL,
  `duracao_minutos` int(11) NOT NULL,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `servicos`
--

INSERT INTO `servicos` (`id`, `barbeiro_id`, `nome_servico`, `preco`, `duracao_minutos`, `criado_em`) VALUES
(1, 1, 'teste', 35.00, 25, '2025-11-12 20:25:47');

-- --------------------------------------------------------

--
-- Estrutura para tabela `tokens_recuperacao`
--

CREATE TABLE `tokens_recuperacao` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `token` varchar(64) NOT NULL,
  `expiracao` datetime NOT NULL,
  `usado` tinyint(1) DEFAULT 0,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `tokens_recuperacao`
--

INSERT INTO `tokens_recuperacao` (`id`, `usuario_id`, `token`, `expiracao`, `usado`, `criado_em`) VALUES
(1, 1, '82669ed2b9f49bb155ac1939de803f74e02f9ddb86064eaebb99cc2868243bcd', '2025-11-15 01:43:34', 0, '2025-11-14 23:43:34'),
(2, 3, '03c681aa0d95dee1fa76ba94d5400b461d39540359597d74e308445cd13ab1e5', '2025-11-15 01:44:54', 1, '2025-11-14 23:44:54');

-- --------------------------------------------------------

--
-- Estrutura para tabela `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `slug` varchar(100) DEFAULT NULL,
  `senha` varchar(255) NOT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `tipo` enum('barbeiro','cliente') NOT NULL,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `usuarios`
--

INSERT INTO `usuarios` (`id`, `nome`, `email`, `slug`, `senha`, `telefone`, `tipo`, `criado_em`) VALUES
(1, 'seujoao', 'joaosilva@gmail.com', 'joao-silva', '$2y$10$OSdm4r3WAnspQpuQGDotkO7ERaQ2ivAQzeL2gzQi6DFR3qfhKQc0.', '(11) 99452-1928', 'barbeiro', '2025-11-12 19:49:35'),
(2, 'delio souza', 'delio@gmail.com', 'delio-souza', '$2y$10$7JcmAmeBUcD3HuGIJkDXoOqRYLdRhJPkjvXCl0OgjzCtzThCVtQeK', '(11) 9999-9999', 'barbeiro', '2025-11-12 20:11:12'),
(3, 'matheus lk', 'matheusrubens08@gmail.com', 'matheus-lk', '$2y$10$0N2ju2BR/DcAZNg3i7Inn.RuHL5Xwxoo/Gq7K9fZ2LEJnKcdS.KD.', '(19) 99506-0330', 'barbeiro', '2025-11-14 23:44:34');

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `agendamentos`
--
ALTER TABLE `agendamentos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cliente_id` (`cliente_id`),
  ADD KEY `barbeiro_id` (`barbeiro_id`),
  ADD KEY `servico_id` (`servico_id`);

--
-- Índices de tabela `servicos`
--
ALTER TABLE `servicos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `barbeiro_id` (`barbeiro_id`);

--
-- Índices de tabela `tokens_recuperacao`
--
ALTER TABLE `tokens_recuperacao`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token` (`token`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `idx_token` (`token`),
  ADD KEY `idx_expiracao` (`expiracao`);

--
-- Índices de tabela `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `agendamentos`
--
ALTER TABLE `agendamentos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de tabela `servicos`
--
ALTER TABLE `servicos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `tokens_recuperacao`
--
ALTER TABLE `tokens_recuperacao`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de tabela `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `agendamentos`
--
ALTER TABLE `agendamentos`
  ADD CONSTRAINT `agendamentos_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `agendamentos_ibfk_2` FOREIGN KEY (`barbeiro_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `agendamentos_ibfk_3` FOREIGN KEY (`servico_id`) REFERENCES `servicos` (`id`);

--
-- Restrições para tabelas `servicos`
--
ALTER TABLE `servicos`
  ADD CONSTRAINT `servicos_ibfk_1` FOREIGN KEY (`barbeiro_id`) REFERENCES `usuarios` (`id`);

--
-- Restrições para tabelas `tokens_recuperacao`
--
ALTER TABLE `tokens_recuperacao`
  ADD CONSTRAINT `tokens_recuperacao_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
